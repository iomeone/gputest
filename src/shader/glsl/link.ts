import { Tree } from '@lezer/common';
import { ShaderDefine, SymbolTable, ParsedModule, ParsedModuleCache, ParsedBundle, RefFlags as RF } from '../types';
import { parseShader, defineConstants, loadModule, loadModuleWithCache } from './shader';
import { rewriteUsingAST, resolveShakeOps } from './ast';
import { parseBundle } from '../util/bundle';
import { getGraphOrder } from '../util/tree';
import { GLSL_VERSION } from '../constants';
import * as T from '../grammar/glsl.terms';
import mapValues from 'lodash/mapValues';
import { DEFAULT_CACHE } from './shader';

const TIMED = false;

const timed = (name: string, f: any) => {
  if (!TIMED) return f;
  return (...args: any[]) => {
    const t = +new Date();
    const v = f(...args);
    console.log(name, (+new Date() - t), 'ms');
    return v;
  }
}

// Override GLSL version/prefix
let PREAMBLE = `#version ${GLSL_VERSION}`;
export const setPreamble = (s: string): string => PREAMBLE = s;
export const getPreamble = (): string => PREAMBLE;

// Link a source module with static modules and dynamic links.
export const linkCode = timed('linkCode', (
  code: string,
  libraries: Record<string, string> = {},
  links: Record<string, string> = {},
  defines: Record<string, ShaderDefine> = {},
  cache: ParsedModuleCache | null = DEFAULT_CACHE,
) => {
  const main = loadModuleWithCache(code, 'main', undefined, cache);

  const parsedLibraries = mapValues(libraries, (code: string, name: string) => loadModuleWithCache(code, name, undefined, cache));
  const parsedLinkDefs = mapValues(links, (code: string, name: string) => loadModuleWithCache(code, name.split(':')[0], undefined, cache));

  return linkModule(main, parsedLibraries, parsedLinkDefs, defines);
});

// Link a bundle of parsed module + libs and dynamic links.
export const linkBundle = timed('linkBundle', (
  bundle: ParsedBundle,
  links: Record<string, ParsedBundle | ParsedModule> = {},
  defines: Record<string, ShaderDefine> = {},
) => {
  let [main, libs] = parseBundle(bundle);

  const linkDefs = mapValues(links, (bundle: ParsedBundle | ParsedModule, name: string) => {
    if ('table' in bundle) return bundle as any as ParsedModule;

    const [link, linkLibs] = parseBundle(bundle as any as ParsedBundle);
    libs = {...libs, ...linkLibs};
    return link;
  });

  return linkModule(main, libs, linkDefs, defines);  
});

// Link a parsed module with static modules and dynamic links.
export const linkModule = timed('linkModule', (
  main: ParsedModule,
  libraries: Record<string, ParsedModule> = {},
  linkDefs: Record<string, ParsedModule> = {},
  defines: Record<string, ShaderDefine> = {},
) => {
  if (typeof main === 'string') throw new Error("Module is a string instead of an object");

  const [links, aliases] = parseLinkAliases(linkDefs);
  const {modules, exported} = loadModules(main, libraries, links);

  const program = [getPreamble(), defineConstants(defines)] as string[];

  const hashes = new Map<string, string>();
  const namespaces = new Map<string, string>();
  const used = new Set<string>();
  const exists = new Set<string>();
  const visible = new Set<string>();
  const fixed = new Map<string, string>();

  for (const module of modules) {
    const {name, code, tree, table, shake} = module;
    const {hash, globals, symbols, visibles, externals, modules} = table;

    // Multiple links into same module with different name
    if (hashes.has(hash)) {
      namespaces.set(name, hashes.get(hash)!);
      continue;
    }

    // Namespace all non-global symbols other than main
    const rename = new Map<string, string>();
    if (module !== main) {
      const namespace = reserveNamespace(module, namespaces, used);
      hashes.set(hash, namespace);

      for (const name of symbols) rename.set(name, namespace + name);
      for (const name of globals) rename.set(name, name);

      for (const name of visibles) visible.add(rename.get(name)!);
      for (const name of rename.values()) exists.add(name);

      for (const name of globals) fixed.set(namespace + name, name);
    }

    // Replace imported symbol names with target
    for (const {name: module, imports} of modules) {
      const namespace = namespaces.get(module);
      for (const {name, imported} of imports) {
        let imp = namespace + imported;
        if (fixed.has(imp)) imp = fixed.get(imp)!;
        if (!exists.has(imp)) console.warn(`Import ${name} from '${module}' does not exist`);
        else if (!visible.has(imp)) console.warn(`Import ${name} from '${module}' is private`);
        rename.set(name, imp);
      }
    }

    // Replace imported function prototype names with target
    for (const {flags, prototype} of externals) if (prototype) {
      const {name} = prototype;
      const resolved = aliases.get(name) ?? name;
      const namespace = namespaces.get(name);

      if ((namespace === undefined) && (flags & RF.Optional)) continue;

      let imp = namespace + resolved;
      if (fixed.has(imp)) imp = fixed.get(imp)!;
      if (!exists.has(imp)) console.warn(`Link ${name}:${resolved} does not exist`);
      else if (!visible.has(imp)) console.warn(`Link ${name}:${resolved} is private`);
      rename.set(name, imp);
    }

    // Shake tree ops based on which symbols were exported
    const keep = exported.get(hash);
    const ops = shake && keep ? resolveShakeOps(shake, keep) : null;

    // Rename symbols using AST while tree shaking
    program.push(rewriteUsingAST(code, tree, rename, ops));
  }

  const result = program.join("\n");
  return result;
});

// Load all modules references from a piece of code
export const loadModules = timed('loadModules', (
  main: ParsedModule,
  libraries: Record<string, ParsedModule>,
  links: Record<string, ParsedModule>,
) => {
  const graph = new Map<string, string[]>();
  const seen = new Set<string>();
  const exported = new Map<string, Set<string>>();

  const out = [] as ParsedModule[];

  // Traverse graph starting from main
  const queue = [{name: main.name, module: main}];
  seen.add(main.name);

  while (queue.length) {
    const next = queue.shift()!;
    const {name, module} = next;
    if (module == null) throw new Error(`Shader module ${name} undefined`);

    out.push(module);

    const {table: {modules, externals}} = module;
    const deps = [] as string[];

    // Recurse into imports
    for (const {name, imports} of modules) {
      const isLink = name.match(/^#/);
      const module = isLink ? links[name] : libraries[name];
      if (!module) throw new Error(`Unknown module '${name}'`);

      if (!seen.has(name)) queue.push({name, module: {...module, name}});
      seen.add(name);
      deps.push(name);

      const {table: {hash}} = module;
      let list = exported.get(hash);
      if (!list) exported.set(hash, list = new Set());
      imports.forEach(i => list!.add(i.name));
    }

    // Recurse into links
    for (const {prototype, flags} of externals) if (prototype) {
      const {name} = prototype;
      const module = links[name];
      if (!module) {
        if (flags & RF.Optional) continue;
        throw new Error(`Unlinked function '${name}'`);
      }

      if (!seen.has(name)) queue.push({name, module: {...module, name}});
      seen.add(name);
      deps.push(name);

      const {table: {hash}} = module;
      let list = exported.get(hash);
      if (!list) exported.set(hash, list = new Set());
      list.add(module.entry ?? name);
    }

    // Build module-to-module dependency graph
    graph.set(name, deps);
  }

  // Sort by graph depth
  const order = getGraphOrder(graph, main.name);
  out.sort((a, b) => order.get(b.name)! - order.get(a.name)! || a.name.localeCompare(b.name));

  return {
    modules: out,
    exported,
  };
});

// Parse run-time specified keys `from:to` into a map of aliases
export const parseLinkAliases = (
  links: Record<string, ParsedModule>,
): [
  Record<string, ParsedModule>,
  Map<string, string>
] => {
  const out = {} as Record<string, ParsedModule>;
  const aliases = new Map<string, string>();
  for (let k in links) {
    const link = links[k];

    let [name, imported] = k.split(':');
    if (!imported && link.entry != null) imported = link.entry;
    out[name] = link;
    aliases.set(name, imported);
  }
  return [out, aliases];
}


// Reserve a unique namespace based on truncated shader hash
export const reserveNamespace = (
  module: ParsedModule,
  namespaces: Map<string, string>,
  used: Set<string>,
) => {
  const {name, table: {hash}} = module;
  let namespace;
  let n = 2;

  do {
    namespace = '_' + hash.slice(0, n++) + '_';
  } while (used.has(namespace));

  namespaces.set(name, namespace);
  used.add(namespace);

  return namespace;
}
