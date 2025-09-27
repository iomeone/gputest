import {
  UniformType, UniformAttribute, UniformAttributeValue,
  ShaderModuleDescriptor, StorageSource, DataBinding, TextureSource, LambdaSource,
} from './types';
import { makeStorageAccessors, checkStorageTypes, checkStorageType } from './storage';
import partition from 'lodash/partition';

// Parse a set of sources for a given set of uniforms/attributes
export const makeShaderBindings = <T>(
  uniforms: UniformAttributeValue[],
  sources: any[],
): DataBinding<T>[] => {
  const n = uniforms.length;
  const out = [] as DataBinding<T>[];
  for (let i = 0; i < n; ++i) {
    const u = uniforms[i];
    const s = sources[i];
    out.push(makeShaderBinding<T>(u, s));
  }
  return out;
}

// Parse a source for a given uniform/attribute
export const makeShaderBinding = <T>(
  uniform: UniformAttributeValue,
  source?: StorageSource | TextureSource | LambdaSource<T> | T | any,
): DataBinding<T> => {
  if (source != null) {
    if (source.shader) {
      const lambda = source as LambdaSource<T>;
      return {uniform, lambda};
    }
    if (source.module || source.table) {
      const lambda = {shader: source} as LambdaSource<T>;
      return {uniform, lambda};
    }
    if (source.buffer && (source.buffer instanceof GPUBuffer)) {
      const storage = source as StorageSource;
      checkStorageType(uniform, storage);
      return {uniform, storage};
    }
    if (source.texture) {
      const texture = source as TextureSource;
      return {uniform, texture};
    }
  }
  return {uniform, constant: source ?? uniform.value};
}

// Bind a value ref for a given uniform/attribute
export const makeRefBinding = <T>(
  uniform: UniformAttributeValue,
  value?: {current: T},
): DataBinding<T> => ({uniform, constant: value ?? uniform.value});
