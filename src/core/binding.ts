import {
  UniformType, UniformAttribute, UniformAttributeValue,
  ShaderModuleDescriptor, StorageSource, DataBinding, TextureSource,
} from './types';
import { makeStorageAccessors, checkStorageTypes, checkStorageType } from './storage';
import { makeShaderModule } from './pipeline';
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
  source?: StorageSource | T | any,
): DataBinding<T> => {
  if (source) {
    if (source.libs || source.table) {
      const lambda = source as T;
      return {uniform, lambda};
    }
    if (source.buffer) {
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

// Bind a shader to a set of data bindings, either as constants or a buffer
export const makeBoundShader = <A, B>(
  vertexShader: A,
  fragmentShader: A,
  links: Record<string, A>,
  defines: Record<string, any>,
  compile: (code: B, stage: string) => any,
  link: (shader: A, links: Record<string, A>, defines: Record<string, any>, cache: any) => B,
  cache: any,
): [ShaderModuleDescriptor, ShaderModuleDescriptor, B, B] => {
  const vertexLinked = link(vertexShader, links, defines, cache);
  const fragmentLinked = link(fragmentShader, links, defines, cache);

  const vertex = makeShaderModule(compile(vertexLinked, 'vertex'));
  const fragment = makeShaderModule(compile(fragmentLinked, 'fragment'));

  return [vertex, fragment, vertexLinked, fragmentLinked];
};
