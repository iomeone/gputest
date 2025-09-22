import { Tree } from '@lezer/common';
import { SymbolTable } from '../types';
import { parseGLSL } from './shader';
import { makeASTParser, rewriteAST } from './ast';
import { GLSL_VERSION } from '../constants';
import * as T from '../grammar/glsl.terms';

type Program = {
  entry: null,
  code: string[],
};

type Module = {
  name: string,
  code: string,
  tree: Tree,
  table: SymbolTable,
};

export const makeProgram = () => ({});

export const linkModule = (
  code: string,
  libraries: Record<string, string> = {},
  links: Record<string, string> = {},
  cache: Map<string, Module> | null = null,
) => {
  const modules = loadModules(code, libraries, links);

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
      for (const {name} of symbols) {
        rename.set(name, namespace + name);
        exists.add(namespace + name);
      }
      for (const {name} of visibles) {
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

    for (const {prototype} of externals) {
      const {name} = prototype;
      const namespace = namespaces.get(name);
      const imp = namespace + name;

      if (!exists.has(imp)) console.warn(`Link ${name} does not exist`);
      else if (!visible.has(imp)) console.warn(`Link ${name} is private`);
      rename.set(name, imp);
    }

    program.push(rewriteAST(code, tree, rename));
    unlinked.push(...externals);
  }

  for (const {prototype} of unlinked) if (prototype) {
    const {name} = prototype;
    const target = links[name];
    if (!target) throw new Error(`Unlinked function ${name}`);
  }

  return program.join("\n");
}

export const loadModules = (
  code: string,
  libraries: Record<string, string>,
  links: Record<string, string>,
) => {
  const seen = new Map<string, number>();
  const out = [];

  const queue = [{name: 'main', code, depth: 0}];
  seen.set('main', 0);

  while (queue.length) {
    const {name, code, depth} = queue.shift()!;

    const tree = parseGLSL(code);
    const table = makeASTParser(code, tree).extractSymbolTable();
    out.push({name, code, tree, table});

    const {modules, externals} = table;
    for (const {name} of modules) {
      const code = libraries[name];
      if (!code) throw new Error(`Unknown module '${name}'`);
      
      if (!seen.has(name)) queue.push({name, code, depth: depth + 1});
      seen.set(name, depth + 1);
    }

    for (const {prototype} of externals) {
      const {name} = prototype;
      const code = links[name];
      if (!code) throw new Error(`Unlinked function '${name}'`);
      
      if (!seen.has(name)) queue.push({name, code, depth: depth + 1});
      seen.set(name, depth + 1);
    }
  }

  out.sort((a, b) => seen.get(b.name)! - seen.get(a.name)! || a.name.localeCompare(b.name));

  return out;
}

export const reserveNamespace = (
  module: Module,
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
