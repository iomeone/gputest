import { Tree } from '@lezer/common';
import { SymbolTable, ParsedModule, ParsedModuleCache } from '../types';
import { parseGLSL } from './shader';
import { makeASTParser, rewriteUsingAST, compressAST, decompressAST, getProgramHash } from './ast';
import { GLSL_VERSION } from '../constants';
import * as T from '../grammar/glsl.terms';
import LRU from 'lru-cache';

const TIMED = false;

const timed = (name: string, f: any) => {
  if (!TIMED) return f;
  return (...args: any[]) => {
    const t = +new Date();
    const v = f(...args);
    console.log(name, (+new Date() - t).toFixed(2), 'ms');
    return v;
  }
}

export const makeModuleCache = (options: Record<string, any> = {}) => new LRU({
  max: 100,
  ...options,
});

export const linkModule = timed('linkModule', (
  code: string,
  libraries: Record<string, string> = {},
  links: Record<string, string> = {},
  cache: ParsedModuleCache | null = null,
) => {
  const modules = loadModules(code, libraries, links, cache);

  const program = [`#version ${GLSL_VERSION}`] as string[];
  const namespaces = new Map<string, string>();

  const used = new Set<string>();
  const exists = new Set<string>();
  const visible = new Set<string>();

  const unlinked = [];
  for (const module of modules) {
    const {name, code, tree, table} = module;
    const {symbols, visibles, externals, modules} = table;

    const namespace = reserveNamespace(module, namespaces, used);

    const rename = new Map<string, string>();
    if (name !== 'main') {
      for (const name of symbols) {
        rename.set(name, namespace + name);
        exists.add(namespace + name);
      }
      for (const name of visibles) {
        visible.add(namespace + name);
      }
    }

    for (const {name: module, imports} of modules) {
      const namespace = namespaces.get(module);
      for (const {name, imported} of imports) {
        const imp = namespace + imported;
        if (!exists.has(imp)) console.warn(`Import ${name} from '${module}' does not exist`);
        else if (!visible.has(imp)) console.warn(`Import ${name} from '${module}' is private`);
        rename.set(name, imp);
      }
    }

    for (const {prototype} of externals) if (prototype) {
      const {name} = prototype;
      const namespace = namespaces.get(name);
      const imp = namespace + name;

      if (!exists.has(imp)) console.warn(`Link ${name} does not exist`);
      else if (!visible.has(imp)) console.warn(`Link ${name} is private`);
      rename.set(name, imp);
    }

    program.push(rewriteUsingAST(code, tree, rename));
    unlinked.push(...externals);
  }

  for (const {prototype} of unlinked) if (prototype) {
    const {name} = prototype;
    const target = links[name];
    if (!target) throw new Error(`Unlinked function ${name}`);
  }

  const result = program.join("\n");
  return result;
})

export const loadModules = timed('loadModules', (
  code: string,
  libraries: Record<string, string>,
  links: Record<string, string>,
  cache: ParsedModuleCache | null = null,
) => {
  const seen = new Map<string, number>();
  const out = [];

  const queue = [{name: 'main', code, depth: 0}];
  seen.set('main', 0);

  while (queue.length) {
    const {name, code, depth} = queue.shift()!;

    let tree, table;
    if (cache) {
      const hash = getProgramHash(code);
      const entry = cache.get(hash);
      if (entry) ({tree, table} = entry);
    }
    if (!tree || !table) {
      tree = parseGLSL(code);
      table = makeASTParser(code, tree).extractSymbolTable();
      if (cache) {
        tree = decompressAST(compressAST(tree));
        cache.set(table.hash, { tree, table });
      }
    }

    out.push({name, code, tree, table});

    const {modules, externals} = table;
    for (const {name} of modules) {
      const code = name.match(/^#/) ? links[name.slice(1)] : libraries[name];
      if (!code) throw new Error(`Unknown module '${name}'`);
      
      if (!seen.has(name)) queue.push({name, code, depth: depth + 1});
      seen.set(name, depth + 1);
    }

    for (const {prototype} of externals) if (prototype) {
      const {name} = prototype;
      const code = links[name];
      if (!code) throw new Error(`Unlinked function '${name}'`);
      
      if (!seen.has(name)) queue.push({name, code, depth: depth + 1});
      seen.set(name, depth + 1);
    }
  }

  out.sort((a, b) => seen.get(b.name)! - seen.get(a.name)! || a.name.localeCompare(b.name));

  return out;
})

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
