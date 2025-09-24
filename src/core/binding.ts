import {
  UniformType, UniformAttribute, UniformAttributeValue,
  ResolvedDataBindings, ResolvedCodeBindings,
  ShaderModuleDescriptor, StorageSource, DataBinding,
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

// Make constant value accessor
export const makeConstantAccessor = (
  uniform: UniformAttributeValue,
) => {
  const {name, format, value} = uniform;
  const v = makeConstantValue(format, value);
  
  return `#pragma export
{format} {name}() { return ${v}; }\n`;
}

const fmtInt   = (x: number) => Math.round(x).toString();
const fmtFloat = (x: number) => x.toPrecision(8);

// Serialize shader value
export const makeConstantValue = (
  format: UniformType,
  value: any,
) => {
  const t = format[0];
  const isFloat = t !== 'u' && t !== 'i' && t !== 'b';
  const fmt = isFloat ? fmtFloat : fmtInt;
  if (value.length) {
    const l = Array.from(value).map(fmt as any).join(', ');
    return `${format}(${l})`;
  }
  else {
    return `${format}(${fmt(value)})`;
  }
}
