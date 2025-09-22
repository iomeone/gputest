import { ShaderLanguages, ShaderCompiler } from '@use-gpu/core/types';
import { ParsedModule, ParsedModuleCache, ShaderDefine } from '../types';
import { Tree, SyntaxNode } from '@lezer/common';

import { makeASTParser, compressAST, decompressAST, getProgramHash } from './ast';
import { parser } from '../grammar/glsl';
import LRU from 'lru-cache';

type LangDef = {
  glsl?: ShaderCompiler,
  cache?: any,
};

// Parse a code module into its in-memory representation
// (AST + symbol table)
export const loadModule = (
  code: string,
  name: string,
  compressed: boolean = false,
): ParsedModule => {
  if (code == null) throw new Error(`Shader code ${name} undefined`);
  let tree = parseGLSL(code);

  const parser = makeASTParser(code, tree);
  const table = parser.getSymbolTable();
  const shake = parser.getShakeTable(table);

  if (compressed) tree = decompressAST(compressAST(tree));

  return {name, code, tree, table, shake};
}

// Use cache to load modules
export const loadModuleWithCache = (
  code: string,
  name: string,
  cache: ParsedModuleCache | null = null,
): ParsedModule => {
  if (!cache) return loadModule(code, name, true);

  const hash = getProgramHash(code);
  const entry = cache.get(hash);
  if (entry) return entry;
  
  const module = loadModule(code, name, true);
  cache.set(hash, module);
  return module;
}

// Parse GLSL using lezer grammar
export const parseGLSL = (code: string): Tree => parser.parse(code);

// Make GLSL definitions
export const defineGLSL = (defs: Record<string, ShaderDefine>): string => {
  const out = [];
  for (let k in defs) if (defs[k] !== false && defs[k] !== null) out.push(`#define ${k} ${defs[k]}`);
  return out.join("\n");
}

// Make shader languages interface
export const makeShaderLanguages = (langs: LangDef[]): ShaderLanguages => {
  const out = {} as any;
  for (const {glsl} of langs) {
    if (glsl) {
      out.glsl = {
        compile: (code: string, stage: any) => (glsl as any)(code, stage, false),
        cache: makeModuleCache(),
      };
    }
  }
  return out;
};

// LRU cache for parsed shader code
export const makeModuleCache = (options: Record<string, any> = {}) => new LRU({
  max: 100,
  ...options,
});
