import {
  UniformType, UniformAttribute, UniformAttributeValue,
  ResolvedDataBindings, ResolvedCodeBindings,
  ShaderModuleDescriptor, StorageSource,
} from './types';
import { makeStorageAccessors, checkStorageTypes, checkStorageType } from './storage';
import { makeUniformBlockAccessor } from './uniform';
import { makeShaderModule } from './pipeline';
import partition from 'lodash/partition';

// Extract data bindings from a list of `constant | buffer | null` values.
export const extractDataBindings = (
  uniforms: UniformAttributeValue[],
  bindings: any[],
): ResolvedDataBindings => {
  const constants = {} as Record<string, any>;
  const links = {} as Record<string, any>;
  for (const u of uniforms) {
    const v = bindings.shift();
    if (v?.buffer != null) {
      const b = v as StorageSource;
      checkStorageType(u, b);
      links[u.name] = b;
    }
    else {
      constants[u.name] = v ?? u.value;
    }
  }
  return {links, constants};
}

// Extract code bindings from a list of `shader | null` values.
export const extractCodeBindings = <T>(
  uniforms: UniformAttributeValue[],
  bindings: any[],
): ResolvedCodeBindings<T> => {
  const constants = {} as Record<string, any>;
  const links = {} as Record<string, T>;
  for (const u of uniforms) {
    const v = bindings.shift();
    if (v?.libs != null || v?.table != null) {
      const s = v as T;
      links[u.name] = s;
    }
    else {
      constants[u.name] = v ?? u.value;
    }
  }
  return {links, constants};
}

// Generate accessors for bound dynamic uniforms, either attribute, lambda or constant
export const makeBoundStorageAccessors = <T>(
  dataUniforms: UniformAttribute[],
  codeUniforms: UniformAttribute[],
  dataBindings: ResolvedDataBindings,
  codeBindings: ResolvedCodeBindings<T>,
  base: number = 0,
): {
  accessors: Record<string, string>,
  attributes: UniformAttribute[],
  constants: UniformAttribute[],
  lambdas: UniformAttribute[],
} => {
  const [attributes, dataConstants] = partition(dataUniforms, ({name}) => !!(dataBindings.links as any)[name]);
  const [lambdas, codeConstants] = partition(codeUniforms, ({name}) => !!(codeBindings.links as any)[name]);
  const constants = [...dataConstants, ...codeConstants];

  const constantAccessors = makeUniformBlockAccessor(constants, base);
  const storageAccessors = makeStorageAccessors(attributes, base, 1);
  const accessors = {...constantAccessors, ...storageAccessors};

  return {accessors, attributes, lambdas, constants};
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
  base: number = 0,
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
