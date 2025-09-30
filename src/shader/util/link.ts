import { Tree } from '@lezer/common';
import { ShaderModule, ParsedBundle, ParsedModule, ParsedModuleCache, ShaderDefine, ImportRef, RefFlags as RF } from '../types';
import { VIRTUAL_BINDINGS } from '../constants';

import { bindBundle, bindModule } from './bind';
import { toBundle, getBundleKey } from './bundle';
import { resolveShakeOps } from './shake';
import mapValues from 'lodash/mapValues.js';

export type Linker = (
  source: ParsedBundle,
  libraries?: Record<string, ShaderModule>,
) => string;

export type LoadModuleWithCache = (
  code: string,
  name: string,
  entry?: string,
  cache?: ParsedModuleCache | null,
) => ParsedModule;

export type GetPreambles = () => string[];

export type GetRenames = (
  defines?: Record<string, ShaderDefine> | null,
) => Map<string, string>;

export type DefineConstants = (
  defines: Record<string, ShaderDefine>
) => string;

export type DefineEnables = (
  enabled: string[],
) => string;

export type RewriteUsingAST = (
  code: string,
  tree: Tree,
  rename: Map<string, string>,
  shake?: number[] | null,
  optionals?: Set<string> | null,
) => string;

const NO_LIBS: Record<string, ShaderModule> = {};

// Link a source module with static modules and dynamic links.
export const makeLinkCode = (
  linker: Linker,
  loadModuleWithCache: LoadModuleWithCache,
  defaultCache: ParsedModuleCache,
) => (
  code: string,
  libraries: Record<string, string> = {},
  links?: Record<string, string | null> | null,
  defines?: Record<string, ShaderDefine> | null,
  cache: ParsedModuleCache | null = defaultCache,
) => {
  const main = loadModuleWithCache(code, 'main', undefined, cache);

  const parsedLibraries = mapValues(libraries, (code: string, name: string) => loadModuleWithCache(code, name, undefined, cache));
  const parsedLinks = mapValues(links, (code: string, name: string) =>
    (
      code != null
      ? loadModuleWithCache(code, name.split(':')[0], undefined, cache)
      : null
    ) as ShaderModule | null
  ) as any;

  const bundle = bindModule(main, parsedLinks, defines);
  return linker(bundle, parsedLibraries);
};

// Link a bundle of parsed module + libs, dynamic links
export const makeLinkBundle = (
  linker: Linker,
) => (
  source: ShaderModule,
  links?: Record<string, ShaderModule | null | undefined>,
  defines?: Record<string, ShaderDefine> | null,
) => {
  let bundle = toBundle(source);
  if (links || defines) bundle = bindBundle(bundle, links, defines);

  return linker(bundle);
};

// Link a bundle of parsed module + libs, dynamic links
export const makeLinkModule = (
  linker: Linker,
) => (
  source: ParsedModule,
  libraries: Record<string, ShaderModule> = NO_LIBS,
  links?: Record<string, ShaderModule | null | undefined>,
  defines?: Record<string, ShaderDefine> | null,
) => {
  let bundle = toBundle(source);
  if (links || defines) bundle = bindBundle(bundle, links, defines);

  return linker(bundle, libraries);
};

// Make a shader linker with injectable language rules
export const makeLinker = (
  getPreambles: GetPreambles,
  getRenames: GetRenames,
  defineConstants: DefineConstants,
  defineEnables: DefineEnables,
  rewriteUsingAST: RewriteUsingAST,
) => (
  source: ShaderModule,
  libraries: Record<string, ShaderModule> = NO_LIBS,
) => {
  const bundle = toBundle(source);
  const main = getBundleKey(source);

  const {bundles, exported, imported, aliased} = loadBundlesInOrder(bundle, libraries);
  const program = getPreambles();

  // Gather defines/enables
  const defs: Record<string, ShaderDefine> = {};
  const enabled: string[] = [];
  for (const {defines, module: {table: {enables}}} of bundles) {
    if (enables) for (const k of enables) enabled.push(k);
    if (defines) for (const k in defines) defs[k] = defines[k];
  }

  const en = defineEnables(enabled)
  if (en.length) program.push(en);

  const staticRename = getRenames(defs);
  const def = defineConstants(defs);
  if (def.length) program.push(def, "");

  // Namespace by module key
  const namespaces = new Map<number, string>();

  // Track symbols in global namespace
  const exists = new Set<string>();
  const visible = new Set<string>();
  const fixed = new Map<string, string>();

  // Track link signatures
  const signatures = new Map<string, any>();
  const infers = new Map<string, string>();

  let hasBoundBindings = false;

  for (const bundle of bundles) {
    const {module} = bundle;
    const {name, code, tree, table, shake, virtual} = module;
    const {globals, symbols, visibles, externals, modules, exports: exp} = table;

    const key = getBundleKey(bundle);
    const importMap = imported.get(key);
    const aliasMap = aliased.get(key);

    let optionals: Set<string> | null = null;

    // Namespace all non-global symbols outside main module
    let scope = '';
    const rename = new Map<string, string>();
    if (key !== main) {
      const namespace = virtual?.namespace;
      const ns = reserveNamespace(key, namespaces, namespace);
      scope = ns;

      if (symbols) for (const name of symbols) rename.set(name, ns + name);
      if (globals) for (const name of globals) {
        rename.set(name, name);
        fixed.set(ns + name, name);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (visibles) for (const name of visibles) visible.add(rename.get(name)!);
      for (const name of rename.values()) exists.add(name);

      // Gather all exported signatures for type inference
      if (exp) for (const {flags, func} of exp) {
        if (func && (flags & RF.Exported)) {
          const {name} = func;
          signatures.set(ns + name, func);
        }
      }
    }

    program.push(`//// @link ${virtual?.render ? code : name} ${scope}\n`);

    // Replace imported symbol names with target
    if (modules) for (const {name: module, imports} of modules) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const key = importMap!.get(module)!;
      const ns = namespaces.get(key);

      for (const {name, imported} of imports) {
        let imp = ns + imported;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (fixed.has(imp)) imp = fixed.get(imp)!;
        if (!exists.has(imp)) {
          console.warn(`Import ${name} from '${module}' does not exist`);
          // eslint-disable-next-line no-debugger
          debugger;
        }
        else if (!visible.has(imp)) console.warn(`Import ${name} from '${module}' is private`);
        rename.set(name, imp);
        infers.set(scope + name, imp);
      }
    }

    // Replace imported function prototype names with target
    if (externals) for (const {flags, func, variable, struct} of externals) if (func ?? variable ?? struct) {
      const {name, inferred} = func ?? variable ?? struct;
      const key = importMap?.get?.(name);
      const ns = namespaces.get(key as number);

      const resolved = aliasMap?.get(name) ?? name;
      if ((ns === undefined) && (flags & RF.Optional)) {
        if (!optionals) optionals = new Set();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        optionals!.add(name);
        continue;
      }

      let imp = ns + resolved;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (fixed.has(imp)) imp = fixed.get(imp)!;
      if (!exists.has(imp)) {
        console.warn(`Link ${name}:${resolved} does not exist`);
        // eslint-disable-next-line no-debugger
        debugger;
      }
      else if (!visible.has(imp)) console.warn(`Link ${name}:${resolved} is private`);
      rename.set(name, imp);

      if (inferred) {
        const sig = signatures.get(imp);
        const {type, parameters} = sig;
        for (const {name, at} of inferred) {
          const resolved = at < 0 ? type : parameters[at];

          let imp = ns + (resolved.type ?? resolved.name ?? resolved);
          let i = imp;
          while ((i = infers.get(imp)) != null) { imp = i; }

          rename.set(name, imp);
          infers.set(scope + name, imp);
        }
      }
    }

    // Copy over static renames
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const k of staticRename.keys()) rename.set(k, staticRename.get(k)!);

    if (name === VIRTUAL_BINDINGS) hasBoundBindings = true;

    if (virtual) {
      const {uniforms, storages, textures} = virtual;
      if ((uniforms || storages || textures) && (!hasBoundBindings)) {
        const id = code.replace('@virtual ', '');
        throw new Error(`Virtual module ${id} has unresolved data bindings`);
      }

      // Emit virtual module in target namespace,
      // with dynamically assigned binding slots.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ns = namespaces.get(key)!;
      const recode = virtual.render(ns, rename, virtual.bindingBase, virtual.volatileBase);
      program.push(recode);
    }
    else if (tree) {
      // Shake tree ops based on which symbols were exported
      const keep = exported.get(key);
      const ops = shake && keep ? resolveShakeOps(shake, keep, symbols) : null;

      // Rename symbols using AST while tree shaking
      const recode = rewriteUsingAST(code, tree, rename, ops, optionals);
      program.push(recode);
    }
    else {
      // Static include
      program.push(code);
    }
  }

  const code = program.join("\n");
  return code;
};

// Load all references from a tree of bundles
// while gathering info about what's exported (for tree shaking).
export const loadBundlesInOrder = (
  bundle: ParsedBundle,
  libraries: Record<string, ShaderModule> = {},
): {
  bundles: ParsedBundle[]
  exported: Map<number, Set<string>>,
  imported: Map<number, Map<string, number>>,
  aliased: Map<number, Map<string, string>>,
} => {
  const graph = new Map<number, number[]>();
  const seen  = new Set<number>();
  const hoist = new Set<number>();

  const exported = new Map<number, Set<string>>();
  const imported = new Map<number, Map<string, number>>();
  const aliased  = new Map<number, Map<string, string>>();

  const bundleMap: Map<number, ParsedBundle> = new Map();

  const {module} = bundle;
  const {name, entry} = module;
  const key = getBundleKey(bundle);
  exported.set(key, new Set([entry ?? 'main']));

  // Traverse graph starting from source
  const queue = [{key, name, chunk: bundle as ShaderModule}];
  seen.add(key);

  const getContext = (m: ParsedModule) => {
    const {name, code} = m;
    if (name.match(/^_[A-Z]{2}_/) && code.match(/^@/)) return code.replace(/^@/, '');
    return name;
  }

  while (queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = queue.shift()!;
    const {key, name, chunk} = next;
    if (chunk == null) throw new Error(`Module '${name}' is undefined`);

    const bundle = toBundle(chunk);
    const {module, libs, links: linkDefs} = bundle;
    const {table: {modules, externals}} = module;
    const deps = graph.get(key) ?? [] as number[];

    const [links, aliases] = parseLinkAliases(linkDefs);

    // Static renames and imports for this module instance
    let aliasMap: Map<string, string> | null = null;
    let importMap: Map<string, number> | null = null;

    // Recurse into links
    if (externals) for (const {flags, func, variable, struct} of externals) if (func ?? variable ?? struct) {
      const {name} = func ?? variable ?? struct;
      const chunk = links[name];
      if (!chunk) {
        if (flags & RF.Optional) {
          continue;
        }
        throw new Error(`Link '${name}' in ${getContext(module)} is not linked`);
      }

      const key = getBundleKey(chunk);
      if (!seen.has(key)) queue.push({key, name, chunk});
      seen.add(key);
      deps.push(key);

      if (!importMap) importMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      importMap!.set(name, key);

      const entry = chunk.entry ?? (chunk as any).module?.entry;
      const symbol = entry ?? aliases?.get(name) ?? name;

      if (symbol !== name) {
        if (!aliasMap) aliasMap = new Map();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        aliasMap!.set(name, symbol);
      }

      let list = exported.get(key);
      if (!list) exported.set(key, list = new Set());
      list.add(symbol);
    }

    // Recurse into imports
    if (modules) for (const {at, name, imports} of modules) {
      const chunk = libs?.[name] ?? libraries[name];
      if (!chunk) throw new Error(`Module '${name}' in ${getContext(module)} is unknown`);

      const key = getBundleKey(chunk);
      if (!seen.has(key)) queue.push({key, name, chunk});
      seen.add(key);
      deps.push(key);

      if (!importMap) importMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      importMap!.set(name, key);

      if (at < 0) hoist.add(key);

      let list = exported.get(key);
      if (!list) exported.set(key, list = new Set());
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      imports.forEach((i: ImportRef) => list!.add(i.imported));
    }

    // Build module-to-module dependency graph
    graph.set(key, deps);

    // Store aliases/imports/bundle
    if (aliasMap) aliased.set(key, aliasMap);
    if (importMap) imported.set(key, importMap);

    if (!bundleMap.has(key)) bundleMap.set(getBundleKey(bundle), bundle);
  }

  // Sort by graph depth
  const order = getGraphOrder(graph, key, hoist);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const out = order.map(key => bundleMap.get(key)!);

  return {
    bundles: out,
    exported,
    imported,
    aliased,
  };
};

// Get depth for each item in a graph, so its dependencies resolve correctly
export const getGraphOrder = (
  graph: Map<number, number[]>,
  key: number,
  hoist?: Set<number>
) => {
  const queue = [{key, depth: 0, path: [key]}];
  const depths = new Map<number, number>();

  while (queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const {key, depth, path} = queue.shift()!;
    const d = hoist?.has(key) ? (1e5 + depth) : depth;
    depths.set(key, Math.max(depths.get(key) || 0, d));

    const modules = graph.get(key);
    if (!modules) continue;

    const n = modules.length;
    const deps = modules.map((key, branch) => {
      const i = path.indexOf(key);
      if (i >= 0) throw new Error("Cycle detected in module dependency graph: " + path.slice(i));
      return {key, depth: d + 1 + (n - branch) * 100, path: [...path, key]};
    });

    queue.push(...deps);
  }

  const keys = [...depths.keys()];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  keys.sort((a, b) => (depths.get(b)! - depths.get(a)!) || (a - b));

  return keys;
}

// Generate a new namespace
export const reserveNamespace = (
  key: string | number,
  namespaces: Map<any, string>,
  force?: string,
): string => {
  const namespace = force ?? '_' + ('00' + (namespaces.size + 1).toString(36)).slice(-2) + '_';
  namespaces.set(key, namespace);
  return namespace;
}

// Parse run-time specified keys `from:to` into a map of aliases
export const parseLinkAliases = <T>(
  links?: Record<string, T>,
): [
  Record<string, T>,
  Map<string, string> | null,
] => {
  const out = {} as Record<string, T>;
  let aliases = null as Map<string, string> | null;

  for (const k in links) {
    const link = links[k] as any;
    if (!link) continue;

    // eslint-disable-next-line prefer-const
    let [name, imported] = k.split(':');
    if (!imported && link.entry != null) imported = link.entry;
    if (!imported && link.module?.entry != null) imported = link.module.entry;

    out[name] = link;
    if (imported) {
      if (!aliases) aliases = new Map<string, string>();
      aliases.set(name, imported);
    }
  }

  return [out, aliases];
}
