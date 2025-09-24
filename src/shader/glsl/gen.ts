import { ParsedBundle, ParsedModule, DataBinding, RefFlags as RF } from '../types';

import { loadVirtualModule } from './shader';
import { PREFIX_VIRTUAL } from '../constants';

const NO_SYMBOLS = [] as string[];
const INT_ARG = ['int'];

const getBindingKey = (b: DataBinding) => (+!!b.constant) + ((+!!b.storage) << 8) + ((+!!b.lambda) << 16);
const getBindingsKey = (bs: DataBinding[]) => bs.reduce((a, b) => a + getBindingKey(b), 0);

export const makeBindingAccessors = (
  bindings: DataBinding[],
  set: number | string = 0,
  key: number | string = getBindingsKey(bindings),
): Record<string, ParsedBundle | ParsedModule> => {

  // Extract uniforms
  const lambdas = bindings.filter(({lambda}) => lambda != null);
  const storages = bindings.filter(({storage}) => storage != null);
  //const textures = bindings.filter(({texture}) => texture != null);
  const constants = bindings.filter(({constant}) => constant != null);

  // Virtual module symbols
  const virtuals = [...constants, ...storages];
  const symbols = virtuals.map(({uniform}) => uniform.name);
  const functions = virtuals.map(({uniform}) => ({
    at: 0,
    symbols: NO_SYMBOLS,
    prototype: {
      name: uniform.name,
      type: {name: uniform.format},
      parameters: uniform.args ?? INT_ARG,
    },
    flags: 0,
  }));

  // Code generator
  const render = (namespace: string, rename: Map<string, string>, base: number = 0) => {
    const program: string[] = [];

    for (const {uniform: {name, format, args}} of constants) {
      program.push(makeUniformFieldAccessor(PREFIX_VIRTUAL, namespace, format, name, args));
    }
    /*
    for (const {uniform: {name, format, args}} of textures) {
      program.push(makeTextureAccessor(namespace, set, base++, format, name));
    }
    */
    for (const {uniform: {name, format, args}} of storages) {
      program.push(makeStorageAccessor(namespace, set, base++, format, name));
    }

    return program.join('\n');
  }

  const virtual = loadVirtualModule({
    uniforms: constants,
    bindings: storages,
    render,
  }, {
    symbols,
    functions,
  }, undefined, key);

  const links: Record<string, ParsedBundle | ParsedModule> = {};
  for (const binding of constants) links[binding.uniform.name] = virtual;
  for (const binding of storages)  links[binding.uniform.name] = virtual;
  //for (const binding of textures)  links[binding.uniform.name] = virtual;
  for (const lambda  of lambdas)   links[lambda.uniform.name] = lambda.lambda!;

  return links;
};

export const makeUniformBlock = (
  constants: DataBinding[],
  set: number | string = 0,
  binding: number | string = 0,
): string => {
  // Uniform Buffer Object struct members
  const members = constants.map(({uniform: {name, format}}) => `${format} ${name}`);
  return members.length ? makeUniformBlockLayout(PREFIX_VIRTUAL, set, binding, members) : '';
}

export const makeUniformBlockLayout = (
  ns: string,
  set: number | string,
  binding: number | string,
  members: string[],
) => `
layout (set = ${set}, binding = ${binding}) uniform ${ns}Type {
  ${members.map(m => `${m};`).join('\n  ')}
} ${ns}Uniform;
`;

export const makeUniformFieldAccessor = (
  uniform: string,
  ns: string,
  type: string,
  name: string,
  args: string[] = INT_ARG,
) => `
${type} ${ns}${name}(${args.join(', ')}) {
  return ${uniform}Uniform.${ns}${name};
}
`;

export const makeStorageAccessor = (
  ns: string,
  set: number | string,
  binding: number | string,
  type: string,
  name: string,
  args: string[] = INT_ARG,
) => `
layout (std430, set = ${set}, binding = ${binding}) readonly buffer ${ns}${name}Type {
  ${type} data[];
} ${ns}${name}Storage;

${type} ${ns}${name}(int index) {
  return ${ns}${name}Storage.data[index];
}
`;

/*
export const makeTextureAccessor = (
  ns: string,
  set: number | string,
  binding: number | string,
  type: string,
  name: string,
  args: string[] = INT_ARG,
) => `
layout (set = ${set}, binding = ${binding}) uniform ${type} ${name};

${type} ${ns}${name}(int index) {
  return ${ns}${name}Storage.data[index];
}
`;
*/