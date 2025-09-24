import { Tree } from '@lezer/common';
import { ParsedModule, ParsedModuleCache, ShaderDefine } from './types';

import { makeLoadModule, makeLoadModuleWithCache } from '../util/shader';
import { makeASTParser, compressAST } from './ast';
import { decompressAST } from '../util/tree';
import { parser } from './grammar/wgsl';
import LRU from 'lru-cache';

export { loadStaticModule, loadVirtualModule } from '../util/shader';


// LRU cache for parsed shader code
export const makeModuleCache = (options: Record<string, any> = {}) => new LRU<string, ParsedModule>({
  max: 100,
  ...options,
});

export const DEFAULT_CACHE = makeModuleCache();

// Parse WGSL code into lezer tree
export const parseShader = (code: string): Tree => parser.parse(code);

// Parse a code module into its in-memory representation
// (AST + symbol table)
export const loadModule = makeLoadModule(parseShader, makeASTParser, compressAST);

// Use cache to load modules
export const loadModuleWithCache = makeLoadModuleWithCache(loadModule, DEFAULT_CACHE);

// Make WGSL definitions
export const defineConstants = (defs: Record<string, ShaderDefine>): string => {
  const out = [];
  for (let k in defs) if (k[0] !== '@' && defs[k] !== false && defs[k] !== null) out.push(`let ${k} = ${defs[k]};`);
  return out.join("\n");
}
