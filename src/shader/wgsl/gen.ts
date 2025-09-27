import { ParsedBundle, ParsedModule, DataBinding, RefFlags as RF } from './types';

import { getHash, makeKey, mixBits, scrambleBits } from '../util/hash';
import { getBundleHash } from '../util/bundle';
import { getBindingArgument } from '../util/bind';
import { loadVirtualModule } from './shader';
import { PREFIX_VIRTUAL } from '../constants';
import { VIRTUAL_BINDGROUP } from './constants';

const INT_PARAMS = [{name: 'index', type: {name: 'u32'}}];
const INT_ARG = ['u32'];
const UV_ARG = ['vec2<f32>'];

const arg = (x: number) => String.fromCharCode(97 + x);

const getBindingKey = (b: DataBinding) => (+!!b.constant) + (+!!b.storage) * 2 + (+!!b.lambda) * 4 + (+!!b.texture) * 8;
const getBindingsKey = (bs: DataBinding[]) => scrambleBits(bs.reduce((a, b) => mixBits(a, getBindingKey(b)), 0)) >>> 0;

export const makeBindingAccessors = (
  bindings: DataBinding[],
): Record<string, ParsedBundle | ParsedModule> => {

  // Extract uniforms by type
  const lambdas = bindings.filter(({lambda}) => lambda != null);
  const storages = bindings.filter(({storage}) => storage != null);
  const textures = bindings.filter(({texture}) => texture != null);
  const constants = bindings.filter(({constant}) => constant != null);

  // Virtual module symbols
  const virtuals = [...constants, ...storages, ...textures];
  const symbols = virtuals.map(({uniform}) => uniform.name);
  const types = virtuals.map(({uniform}) => uniform.format);
  const declarations = virtuals.map(({uniform}) => ({
    at: 0,
    symbol: uniform.name,
    func: {
      name: uniform.name,
      type: {name: uniform.format},
      parameters: uniform.args ?? INT_PARAMS,
    },
    flags: 0,
  }));

  // Hash + readable representation
  const readable = symbols.join(' ');
  const signature = getBindingsKey(bindings).toString(16);
  const external = lambdas.map(l => getBundleHash(l.lambda!.shader));
  const unique = `@access [${signature}] [${external}] [${readable}] [${types.join(' ')}]`;

  const hash  = getHash(unique);
  const code  = `@access [${readable}] [${hash}]`;

  // Code generator
  const render = (namespace: string, rename: Map<string, string>, base: number = 0) => {
    const program: string[] = [];
    const set = getBindingArgument(rename.get(VIRTUAL_BINDGROUP));

    for (const {uniform: {name, format, args}} of constants) {
      program.push(makeUniformFieldAccessor(PREFIX_VIRTUAL, namespace, format, name, args));
    }

    for (const {uniform: {name, format, args}} of storages) {
      program.push(makeStorageAccessor(namespace, set, base++, format, name));
    }

    for (const {uniform: {name, format, args}, texture} of textures) {
      program.push(makeTextureAccessor(namespace, set, base++, format, name, texture!.layout, texture!.variant, texture!.absolute));
      base++;
    }

    return program.join('\n');
  }

  const virtual = loadVirtualModule({
    uniforms: constants,
    storages,
    textures,
    render,
  }, {
    symbols,
    declarations,
  }, undefined, hash, code);

  const links: Record<string, ParsedBundle | ParsedModule> = {};
  for (const binding of constants) links[binding.uniform.name] = virtual;
  for (const binding of storages)  links[binding.uniform.name] = virtual;
  for (const binding of textures)  links[binding.uniform.name] = virtual;
  for (const lambda  of lambdas)   links[lambda.uniform.name]  = lambda.lambda!.shader;

  return links;
};

export const makeUniformBlock = (
  constants: DataBinding[],
  set: number | string = 0,
  binding: number | string = 0,
): string => {
  // Uniform Buffer Object struct members
  const members = constants.map(({uniform: {name, format}}) => `${name}: ${format}`);
  return members.length ? makeUniformBlockLayout(PREFIX_VIRTUAL, set, binding, members) : '';
}

export const makeUniformBlockLayout = (
  ns: string,
  set: number | string,
  binding: number | string,
  members: string[],
) => `
struct ${ns}Type {
  ${members.map(m => `${m},`).join('\n  ')}
};
@group(${set}) @binding(${binding}) var<uniform> ${ns}Uniform: ${ns}Type;
`;

export const makeUniformFieldAccessor = (
  uniform: string,
  ns: string,
  type: string,
  name: string,
  args: string[] = INT_ARG,
) => `
fn ${ns}${name}(${args.map((t, i) => `${arg(i)}: ${t}`).join(', ')}) -> ${type} {
  return ${uniform}Uniform.${ns}${name};
}
`;

export const makeStorageAccessor = (
  ns: string,
  set: number | string,
  binding: number | string,
  type: string,
  name: string,
) => `
@group(${set}) @binding(${binding}) var<storage> ${ns}${name}Storage: array<${type}>;

fn ${ns}${name}(index: u32) -> ${type} {
  return ${ns}${name}Storage[index];
}
`;

export const makeTextureAccessor = (
  ns: string,
  set: number | string,
  binding: number,
  type: string,
  name: string,
  layout: string,
  variant: string = 'textureSample',
  absolute: boolean = false,
  args: string[] = UV_ARG,
) => {
  const m = layout.match(/[0-9]/) ?? [2];
  const dims = +m[0];
  const dimsCast = dims === 1 ? 'f32' : `vec${dims}<f32>`;

  return `
@group(${set}) @binding(${binding}) var ${ns}${name}Sampler: sampler;
@group(${set}) @binding(${binding + 1}) var ${ns}${name}Texture: ${layout};

fn ${ns}${name}(${args.map((t, i) => `${arg(i)}: ${t}`).join(', ')}) -> ${type} {
  ${absolute ? `let _VT_UV = ${arg(0)} / ${dimsCast}(textureDimensions(${ns}${name}Texture));\n  `
  : ``}return ${variant}(${ns}${name}Texture, ${ns}${name}Sampler, ${args.map((_, i) => `${i === 0 && absolute ? '_VT_UV' : arg(i)}`).join(', ')});
}
`
};
