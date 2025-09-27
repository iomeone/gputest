import {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  defineConstants,
  makeModuleCache,

  bundleToAttribute,
  bundleToAttributes,
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
} from './cast';

import {
  chainTo,
} from './chain';

import {
  diffBy,
} from './diff';

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

import {
  getHash
} from '../util/hash';

export {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  defineConstants,
  makeModuleCache,

  bundleToAttribute,
  bundleToAttributes,
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
} from './cast';

export {
  chainTo,
} from './chain';

export {
  diffBy,
} from './diff';

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

export {
  getHash
} from '../util/hash';

export const GLSLLinker = {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  bundleToAttribute,
  bundleToAttributes,

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
  chainTo,
  diffBy,

  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,

  makeModuleCache,

  getHash,
  bundleToAttribute,
  bundleToAttributes,
};

export default GLSLLinker;