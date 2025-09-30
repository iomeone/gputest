/** @module Shader */
import GLSL from './glsl/index';
import WGSL from './wgsl/index';

export const GLSLLinker = GLSL;
export const WGSLLinker = WGSL;

export { getBundleHash, getBundleKey, getBundleEntry, getBundleLabel, toBundle, toModule } from './util/index';
export * from './types';
