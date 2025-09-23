import {
  parseShader,
  loadModule,
  loadModuleWithCache,
  defineConstants,
  makeLanguage,
  makeModuleCache,
} from './shader';

import {
  linkBundle,
  linkModule,
  linkCode,
  getPreamble,
  setPreamble,
} from './link';

import {
  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,
} from './ast';

export {
  parseShader,
  loadModule,
  loadModuleWithCache,
  defineConstants,
  makeLanguage,
  makeModuleCache,
} from './shader';

export {
  linkBundle,
  linkModule,
  linkCode,
  getPreamble,
  setPreamble,
} from './link';

export {
  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,
} from './ast';

export const GLSLLinker = {
  loadModule,
  loadModuleWithCache,

  parseShader,
  defineConstants,

  linkBundle,
  linkModule,
  linkCode,
  getPreamble,
  setPreamble,

  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,

  makeLanguage,
  makeModuleCache,
};

export default GLSLLinker;