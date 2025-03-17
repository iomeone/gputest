import type {
  UniformAttribute, UniformAttributeValue,
  ShaderModule, StorageSource, DataBinding, TextureSource, LambdaSource, SamplerSource,
} from './types';
import { checkStorageType } from './storage';
import { checkTextureType } from './texture';

/**
 * Parse a set of shader sources for use with a given set of uniforms/attributes.
 */
export const makeShaderBindings = <T extends ShaderModule>(
  attributes: (UniformAttribute | UniformAttributeValue)[],
  sources: (StorageSource | TextureSource | LambdaSource<T> | any)[],
): DataBinding<T>[] => {
  const n = attributes.length;
  const out = [] as DataBinding<T>[];
  for (let i = 0; i < n; ++i) {
    const u = attributes[i];
    const s = sources[i];
    out.push(makeShaderBinding<T>(u, s));
  }
  return out;
}

/**
 * Parse a source for use with a given uniform/attribute.
 */
export const makeShaderBinding = <T extends ShaderModule>(
  attribute: UniformAttribute | UniformAttributeValue,
  source?: SamplerSource | StorageSource | TextureSource | LambdaSource<T> | T | any,
): DataBinding<T> => {
  if (source != null) {
    if (source.gpuContext) {
      throw new Error("Passing OffscreenTarget directly to shader. Pass `target.source` instead.");
    }
    if (source.shader) {
      const lambda = source as LambdaSource<T>;
      return {attribute, lambda};
    }
    if (source.module || source.table) {
      const lambda = {shader: source} as LambdaSource<T>;
      return {attribute, lambda};
    }
    if (source.buffer && (source.buffer instanceof GPUBuffer)) {
      const storage = source as StorageSource;
      checkStorageType(attribute, storage);
      if (source.addressSpace === 'uniform') return {attribute, uniform: storage};
      return {attribute, storage};
    }
    if (source.texture || source.view) {
      const texture = source as TextureSource;
      checkTextureType(attribute, texture);
      return {attribute, texture};
    }
    if (source.sampler) {
      const sampler = source as SamplerSource;
      return {attribute, sampler};
    }
  }
  return {attribute, constant: source ?? (attribute as any).value};
}

/**
 * Make a binding for a wrapped value (a ref) for use with a given uniform/attribute.
 */
export const makeRefBinding = <T extends ShaderModule>(
  attribute: UniformAttribute | UniformAttributeValue,
  value?: {current: T} | T,
): DataBinding<T> => ({attribute, constant: value ?? (attribute as any).value});

export const isShaderBinding = <T extends ShaderModule>(
  source?: StorageSource | TextureSource | LambdaSource<T> | T | any,
): source is StorageSource | TextureSource | LambdaSource<T> | T => {
  if (source != null) {
    return !!(
      (source.shader) ||
      (source.module || source.table) ||
      (source.buffer && (source.buffer instanceof GPUBuffer)) ||
      (source.texture || source.view)
    );
  }
  return false;
}

export const decodeBufferUsageFlags = (flags: number = 0) => {
  const out = [];
  for (const k in GPUBufferUsage) if (flags & (GPUBufferUsage as any)[k]) out.push(k);
  return out.join(' | ');
};
