import {
  parseShader,
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  defineConstants,
  makeLanguage,
  makeModuleCache,
} from './shader';

import {
  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  resolveBindings,
} from './bind';

import {
  castTo,
  bundleToAttribute,
} from './cast';

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
  loadStaticModule,
  defineConstants,
  makeLanguage,
  makeModuleCache,
} from './shader';

export {
  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  resolveBindings,
} from './bind';

export {
  castTo,
  bundleToAttribute,
} from './cast';

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
  loadStaticModule,

  parseShader,
  defineConstants,

  linkBundle,
  linkModule,
  linkCode,
  getPreamble,
  setPreamble,

  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  resolveBindings,

  castTo,
  bundleToAttribute,

  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,

  makeLanguage,
  makeModuleCache,
};

export default GLSLLinker;