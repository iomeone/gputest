import { Tree } from '@lezer/common';
import { ParsedBundle, ParsedModule, ParsedModuleCache, ShaderDefine, ImportRef, RefFlags as RF } from '../types';
import { VIRTUAL_BINDINGS } from '../constants';

import { bindBundle, bindModule } from './bind';
import { toBundle, getBundleKey } from './bundle';
import { resolveShakeOps } from './shake';
import { timed } from './timed';
import mapValues from 'lodash/mapValues';

export type Linker = (
  source: ParsedBundle,
  libraries?: Record<string, ParsedBundle | ParsedModule>,
) => string;

export type LinkModule = (
  main: ParsedModule,
  libraries?: Record<string, ParsedModule>,
  linkDefs?: Record<string, ParsedModule>,
  defines?: Record<string, ShaderDefine> | null,
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

export type RewriteUsingAST = (
  code: string,
  tree: Tree,
  rename: Map<string, string>,
  shake?: number[] | null,
  optionals?: Set<string> | null,
) => string;

const NO_LIBS: Record<string, ParsedBundle | ParsedModule> = {};

// Link a source module with static modules and dynamic links.
export const makeLinkCode = (
  linker: Linker,
  loadModuleWithCache: LoadModuleWithCache,
  defaultCache: ParsedModuleCache,
) => timed('linkCode', (
  code: string,
  libraries: Record<string, string> = {},
  links?: Record<string, string> | null,
  defines?: Record<string, ShaderDefine> | null,
  cache: ParsedModuleCache | null = defaultCache,
) => {
  const main = loadModuleWithCache(code, 'main', undefined, cache);

  const parsedLibraries = mapValues(libraries, (code: string, name: string) => loadModuleWithCache(code, name, undefined, cache));
  const parsedLinks = mapValues(links, (code: string, name: string) => loadModuleWithCache(code, name.split(':')[0], undefined, cache));

  const bundle = bindModule(main, parsedLinks, defines);
  return linker(bundle, parsedLibraries);
});

// Link a bundle of parsed module + libs, dynamic links
export const makeLinkBundle = (
  linker: Linker,
) => timed('linkBundle', (
  source: ParsedBundle | ParsedModule,
  links?: Record<string, ParsedBundle | ParsedModule>,
  defines?: Record<string, ShaderDefine> | null,
) => {
  let bundle = toBundle(source);
  if (links || defines) bundle = bindBundle(bundle, links, defines);

  return linker(bundle);
});

// Link a bundle of parsed module + libs, dynamic links
export const makeLinkModule = (
  linker: Linker,
) => timed('linkBundle', (
  source: ParsedModule,
  libraries: Record<string, ParsedBundle | ParsedModule> = NO_LIBS,
  links?: Record<string, ParsedBundle | ParsedModule>,
  defines?: Record<string, ShaderDefine> | null,
) => {
  let bundle = toBundle(source);
  if (links || defines) bundle = bindBundle(bundle, links, defines);

  return linker(bundle, libraries);
});

// Make a shader linker with injectable language rules
export const makeLinker = (
  getPreambles: GetPreambles,
  getRenames: GetRenames,
  defineConstants: DefineConstants,
  rewriteUsingAST: RewriteUsingAST,
) => (
  source: ParsedBundle | ParsedModule,
  libraries: Record<string, ParsedBundle | ParsedModule> = NO_LIBS,
) => {
  const bundle = toBundle(source);
  const main = getBundleKey(source);

  const {bundles, exported, imported, aliased} = loadBundlesInOrder(bundle, libraries);
  const program = getPreambles();

  // Gather defines
  const defs: Record<string, ShaderDefine> = {};
  for (const {defines} of bundles) if (defines) for (let k in defines) defs[k] = defines[k];

  const staticRename = getRenames(defs);
  const def = defineConstants(defs);
  if (def.length) program.push(def);

  // Namespace by module key
  const namespaces = new Map<string, string>();

  // Track symbols in global namespace 
  const exists = new Set<string>();
  const visible = new Set<string>();
  const fixed = new Map<string, string>();

  let hasBoundVirtuals = false;

  for (const bundle of bundles) {
    const {module, defines} = bundle;
    const {name, code, tree, table, shake, virtual} = module;
    const {globals, symbols, visibles, externals, modules} = table;

    const key = getBundleKey(bundle);
    const importMap = imported.get(key);
    const aliasMap = aliased.get(key);

    let optionals: Set<string> | null = null;

    // Namespace all non-global symbols outside main module
    const rename = new Map<string, string>();
    if (key !== main) {
      const namespace = virtual?.namespace;
      const ns = reserveNamespace(key, namespaces, namespace);

      if (symbols) for (const name of symbols) rename.set(name, ns + name);
      if (globals) for (const name of globals) {
        rename.set(name, name);
        fixed.set(ns + name, name);
      }
      if (visibles) for (const name of visibles) visible.add(rename.get(name)!);
      for (const name of rename.values()) exists.add(name);
    }

    // Replace imported symbol names with target
    if (modules) for (const {name: module, imports} of modules) {
      const key = importMap!.get(module);
      const ns = namespaces.get(key);

      for (const {name, imported} of imports) {
        let imp = ns + imported;
        if (fixed.has(imp)) imp = fixed.get(imp)!;
        if (!exists.has(imp)) {
          console.warn(`Import ${name} from '${module}' does not exist`);
          debugger;
        }
        else if (!visible.has(imp)) console.warn(`Import ${name} from '${module}' is private`);
        rename.set(name, imp);
      }
    }

    // Replace imported function prototype names with target
    if (externals) for (const {flags, func} of externals) if (func) {
      const {name} = func;
      const key = importMap!.get(name);
      const ns = namespaces.get(key);

      const resolved = aliasMap?.get(name) ?? name;
      if ((ns === undefined) && (flags & RF.Optional)) {
        if (!optionals) optionals = new Set();
        optionals!.add(name);
        continue;
      }

      let imp = ns + resolved;
      if (fixed.has(imp)) imp = fixed.get(imp)!;
      if (!exists.has(imp)) {
        console.warn(`Link ${name}:${resolved} does not exist`);
        debugger;
      }
      else if (!visible.has(imp)) console.warn(`Link ${name}:${resolved} is private`);
      rename.set(name, imp);
    }

    // Copy over static renames
    for (let k of staticRename.keys()) rename.set(k, staticRename.get(k)!);

    if (name === VIRTUAL_BINDINGS) hasBoundVirtuals = true;

    if (virtual) {
      const {uniforms, storages, textures} = virtual;
      if ((uniforms || storages || textures) && (!hasBoundVirtuals)) {
        const id = code.replace('#virtual ', '');
        throw new Error(`Virtual module ${id} has unresolved data bindings`);
      }

      // Emit virtual module in target namespace,
      // with dynamically assigned binding slots.
      const ns = namespaces.get(key)!;
      const recode = virtual.render(ns, rename, virtual.base);
      program.push(recode);
    }
    else if (tree) {
      // Shake tree ops based on which symbols were exported
      const keep = exported.get(key);
      const ops = shake && keep ? resolveShakeOps(shake, keep) : null;

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
export const loadBundlesInOrder = timed('loadBundlesInOrder', (
  bundle: ParsedBundle,
  libraries: Record<string, ParsedModule> = {},
): {
  bundles: ParsedBundle[]
  exported: Map<string, Set<string>>,
  imported: Map<string, Map<string, string>>,
  aliased: Map<string, Map<string, string>>,
} => {
  const graph = new Map<string, string[]>();
  const seen  = new Set<string>();
  const hoist = new Set<string>();

  const exported = new Map<string, Set<string>>();
  const imported = new Map<string, Map<string, string>>();
  const aliased  = new Map<string, Map<string, string>>();

  const out: ParsedBundle[] = [];

  const {module} = bundle;
  const {name} = module;
  const key = getBundleKey(bundle);

  // Traverse graph starting from source
  const queue = [{key, name, chunk: bundle as ParsedBundle | ParsedModule}];
  seen.add(key);

  const getContext = (m: ParsedModule) => {
    const {name, code} = m;
    if (name.match(/^_[A-Z]{2}_/) && code.match(/^@/)) return code.replace(/^@/, '');
    return name;
  }

  while (queue.length) {
    const next = queue.shift()!;
    const {key, name, chunk} = next;
    if (chunk == null) throw new Error(`Shader module ${name} is undefined`);

    const bundle = toBundle(chunk);
    const {module, libs, links: linkDefs} = bundle;
    const {table: {modules, externals}} = module;
    const deps = [] as string[];

    const [links, aliases] = parseLinkAliases(linkDefs);

    // Static renames and imports for this module instance
    let aliasMap: Map<string, string> | null = null;
    let importMap: Map<string, string> | null = null;

    // Recurse into imports
    if (modules) for (const {at, name, imports} of modules) {
      const chunk = libs?.[name] ?? libraries[name];
      if (!chunk) throw new Error(`Unknown module '${name}' in ${getContext(module)}`);

      const key = getBundleKey(chunk);
      if (!seen.has(key)) queue.push({key, name, chunk});
      seen.add(key);
      deps.push(key);

      if (!importMap) importMap = new Map();
      importMap!.set(name, key);

      if (at < 0) hoist.add(key);

      let list = exported.get(key);
      if (!list) exported.set(key, list = new Set());
      imports.forEach((i: ImportRef) => list!.add(i.imported));
    }

    // Recurse into links
    if (externals) for (const {func, flags} of externals) if (func) {
      const {name} = func;
      const chunk = links[name];
      if (!chunk) {
        if (flags & RF.Optional) {
          continue;
        }
        throw new Error(`Unlinked function '${name}' in ${getContext(module)}`);
      }

      const key = getBundleKey(chunk);
      if (!seen.has(key)) queue.push({key, name, chunk});
      seen.add(key);
      deps.push(key);

      if (!importMap) importMap = new Map();
      importMap!.set(name, key);

      const entry = chunk.entry ?? (chunk as any).module?.entry;
      const symbol = entry ?? aliases?.get(name) ?? name;

      if (symbol !== name) {
        if (!aliasMap) aliasMap = new Map();
        aliasMap!.set(name, symbol);
      }

      let list = exported.get(key);
      if (!list) exported.set(key, list = new Set());
      list.add(symbol);
    }

    // Build module-to-module dependency graph
    graph.set(key, deps);

    // Store aliases/imports/bundle
    if (aliasMap) aliased.set(key, aliasMap);
    if (importMap) imported.set(key, importMap);

    out.push(bundle);
  }

  // Sort by graph depth
  const order = getGraphOrder(graph, key);
  for (let [k, v] of order.entries()) if (hoist.has(k)) order.set(k, v + 1e5);
  out.sort((a, b) => order.get(getBundleKey(b))! - order.get(getBundleKey(a))! || a.module.name.localeCompare(b.module.name));

  return {
    bundles: out,
    exported,
    imported,
    aliased,
  };
});


// Generate a new namespace
export const reserveNamespace = (
  key: string | number,
  namespaces: Map<any, string>,
  force?: string,
): string => {
  let namespace = force ?? '_' + ('00' + (namespaces.size + 1).toString(36)).slice(-2) + '_';
  namespaces.set(key, namespace);
  return namespace;
}

// Get depth for each item in a graph, so its dependencies resolve correctly
export const getGraphOrder = (
  graph: Map<string, string[]>,
  name: string,
  depth: number = 0,
) => {
  const queue = [{name, depth: 0, path: [name]}];
  const depths = new Map<string, number>();

  while (queue.length) {
    const {name, depth, path} = queue.shift()!;
    depths.set(name, depth);

    const module = graph.get(name);
    if (!module) continue;

    const deps = module.map(name => {
      const i = path.indexOf(name);
      if (i >= 0) throw new Error("Cycle detected in module dependency graph: " + path.slice(i));
      return {name, depth: depth + 1, path: [...path, name]};
    });

    queue.push(...deps);
  }
  return depths;
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

  for (let k in links) {
    const link = links[k] as any;
    if (!link) continue;

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
