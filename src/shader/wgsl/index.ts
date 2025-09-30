import {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  transpileWGSL,
  bindEntryPoint,
  defineConstants,
  makeModuleCache,

  bundleToAttribute,
  bundleToAttributes,

  wgsl, f32, i32, u32,
  symbolDictionary,
} from './shader';

import {
  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  sourceToModule,
  resolveBindings,
  extractBindings,
} from './bind';

import {
  castTo,
  swizzleTo,
} from './operators/cast';

import {
  chainTo,
} from './operators/chain';

import {
  diffBy,
} from './operators/diff';

import {
  explode,
} from './operators/explode';

import {
  instanceWith,
} from './operators/instanced';

import {
  structType,
} from './operators/struct';

import {
  linkBundle,
  linkModule,
  linkCode,
} from './link';

import {
  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,
} from './ast';

import {
  getBundleEntry,
  getBundleHash,
  getBundleKey,
  getBundleLabel,
} from '../util/bundle';

import {
  decompressString,
} from '../util/tree';

import { parser } from './highlight/wgsl';

export * from './types';

export {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  transpileWGSL,
  bindEntryPoint,
  defineConstants,
  makeModuleCache,

  bundleToAttribute,
  bundleToAttributes,

  wgsl, f32, i32, u32,
  symbolDictionary,
} from './shader';

export {
  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  sourceToModule,
  resolveBindings,
  extractBindings,
} from './bind';

export {
  castTo,
  swizzleTo,
} from './operators/cast';

export {
  chainTo,
} from './operators/chain';

export {
  diffBy,
} from './operators/diff';

export {
  explode,
} from './operators/explode';

export {
  instanceWith,
} from './operators/instanced';

export {
  structType,
} from './operators/struct';

export {
  linkBundle,
  linkModule,
  linkCode,
} from './link';

export {
  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,
} from './ast';

export {
  getBundleEntry,
  getBundleHash,
  getBundleKey,
  getBundleLabel,
} from '../util/bundle';

export {
  decompressString,
} from '../util/tree';

export const WGSLLinker = {
  loadModule,
  loadModuleWithCache,
  loadStaticModule,
  transpileWGSL,
  bindEntryPoint,
  bundleToAttribute,
  bundleToAttributes,
  wgsl, f32, i32, u32,

  defineConstants,

  linkBundle,
  linkModule,
  linkCode,

  bindBundle,
  bindModule,
  bindingsToLinks,
  bindingToModule,
  sourceToModule,
  resolveBindings,
  extractBindings,

  castTo,
  chainTo,
  diffBy,
  explode,
  instanceWith,
  swizzleTo,
  structType,

  makeASTParser,
  compressAST,
  decompressAST,
  rewriteUsingAST,

  makeModuleCache,

  getBundleEntry,
  getBundleHash,
  getBundleKey,
  getBundleLabel,

  decompressString,
  symbolDictionary,

  parser,
};

export { parser } from './highlight/wgsl';

export * from './types';

export default WGSLLinker;