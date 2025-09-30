import { ShaderModule, LambdaSource, UniformAttribute, DataBinding, ModuleRef, RefFlags as RF } from './types';

import { formatMurmur53, toMurmur53, getObjectKey, mixBits, scrambleBits } from '../util/hash';
import { getBundleHash, getBundleEntry, getBundleName, toBundle, toModule } from '../util/bundle';
import { getBindingArgument } from '../util/bind';
import { loadVirtualModule, bundleToAttribute } from './shader';
import { castTo, makeSwizzle } from './operators/cast';
import { PREFIX_VIRTUAL } from '../constants';
import { VIRTUAL_BINDGROUP, VOLATILE_BINDGROUP } from './constants';

const INT_PARAMS = [{name: 'index', type: {name: 'u32'}}];
const INT_ARG = ['u32'];
const UV_ARG = ['vec2<f32>'];

const arg = (x: number) => String.fromCharCode(97 + x);

const is3to4 = (type: string) => type.match(/vec3to4</);
const to3 = (type: string) => type.replace(/vec3to4</, 'vec3<');
const to4 = (type: string) => type.replace(/vec3to4</, 'vec4<');

const is8to32 = (type: string) => type.match(/^(u|i)8$/);
const is16to32 = (type: string) => type.match(/^(u|i)16$/);
const isVec8to32 = (type: string) => type.match(/^vec[234]<(u|i)8>$/);
const isVec16to32 = (type: string) => type.match(/^vec[234]<(u|i)16>$/);

const to32 = (type: string) => type.replace(/^(vec[234]<)?([ui])[0-9]+/, '$1$232');

const needsCast = (from: string, to: string) => {
  if (from.match(/[A-Z]/)) return false;
  return from.replace(/[^0-9]+/, '') != to.replace(/[^0-9]+/, '');
};

const getTypeKey = (b: DataBinding) =>
  (+!!b.constant) +
  (+!!b.storage) * 2 +
  (+!!b.lambda) * 4 +
  (+!!b.texture) * 8 +
  (+!!(b.storage?.volatile || b.texture?.volatile)) * 16;

const getFormatKey = (b: DataBinding) =>
  b.texture ? toMurmur53(b.texture?.format) ^
              toMurmur53(b.texture?.layout) ^
              toMurmur53(b.texture?.variant) ^
              toMurmur53(b.texture?.absolute) :
  b.storage ? toMurmur53(b.storage?.format) :
  0;

const getBindingsKey = (bs: DataBinding[]) => scrambleBits(bs.reduce((a, b) => mixBits(a, getTypeKey(b) ^ getFormatKey(b)), 0)) >>> 0;
const getValueKey = (b: DataBinding) => getObjectKey(b.constant ?? b.storage ?? b.texture);

export const makeBindingAccessors = (
  bindings: DataBinding[],
): Record<string, ShaderModule> => {

  // Extract uniforms by type
  const lambdas = bindings.filter(({lambda}) => lambda != null);
  const storages = bindings.filter(({storage}) => storage != null);
  const textures = bindings.filter(({texture}) => texture != null);
  const constants = bindings.filter(({constant}) => constant != null);

  // Virtual module symbols
  const virtuals = [...constants, ...storages, ...textures];
  const symbols = virtuals.map(({uniform}) => uniform.name);
  const types = virtuals.map(({uniform}) => uniform.format);
  const exports = virtuals.map(({uniform}) => ({
    func: {
      name: uniform.name,
      type: {name: uniform.format},
      parameters: uniform.args ?? INT_PARAMS,
    },
    flags: RF.Exported,
  })) as any[];

  // Inject import for storage struct types
  const libs: Record<string, ShaderModule> = {};
  const modules = storages.map(({uniform, storage}) => {
    const {type: typeOut} = uniform;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const {type: typeIn} = storage!;

    const type = typeOut ?? typeIn;
    if (type) {
      const entry = getBundleEntry(type);
      if (entry != null) {
        const module = toModule(type);
        libs[module.name] = module;
        return {
          at: 0,
          name: module.name,
          imports: [{name: entry, imported: entry}],
          symbols: [entry],
        } as ModuleRef;
      }
    }

    return null;
  }).filter((m: any) => !!m) as ModuleRef[];

  // Hash + readable representation
  const readable = symbols.join(' ');
  const signature = getBindingsKey(bindings).toString(16);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const external = lambdas.map(l => getBundleHash(l.lambda!.shader));
  const unique = `@access [${signature}] [${external}] [${readable}] [${types.join(' ')}]`;

  const hash = toMurmur53(unique);
  const code = `@access [${readable}] [${formatMurmur53(hash)}]`;

  const keyed = bindings.reduce((a, s) => mixBits(a, getValueKey(s)), 0);
  const key   = toMurmur53(`${formatMurmur53(hash)} ${keyed}`);

  // Code generator
  const render = (
    namespace: string,
    rename: Map<string, string>,
    bindingBase: number = 0,
    volatileBase: number = 0,
  ) => {
    const program: string[] = [];
    const bindingSet = getBindingArgument(rename.get(VIRTUAL_BINDGROUP));
    const volatileSet = getBindingArgument(rename.get(VOLATILE_BINDGROUP));

    for (const {uniform: {name, format: type, args}} of constants) {
      if (typeof type !== 'string') throw new Error(`Cannot make uniform for struct type`);
      program.push(makeUniformFieldAccessor(PREFIX_VIRTUAL, namespace, type, name, args as any));
    }

    for (const {uniform: {name, format: formatOut, type: typeOut, args}, storage} of storages) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const {volatile, format: formatIn, type: typeIn, readWrite} = storage!;
      const set = volatile ? volatileSet : bindingSet;
      const base = volatile ? volatileBase++ : bindingBase++;

      const type = typeOut ?? typeIn;
      if (type) {
        const format = type === typeOut ? formatOut : formatIn;
        const entry = getBundleEntry(type);
        let t = (entry ? rename.get(entry) : null) ?? entry ?? 'unknown';
        if (t === 'unknown') throw new Error(`Invalid type '${getBundleName(type)}'. Module has no entry point.`);

        if (format === 'array<T>') t = `array<${t}>`;
        program.push(makeStorageAccessor(namespace, set, base, t, t, name, readWrite, args));
        continue;
      }

      if (Array.isArray(formatIn) || Array.isArray(formatOut)) throw new Error(`Cannot bind data to a type`);

      if (formatIn === 'T' || formatOut === 'T') {
        // eslint-disable-next-line no-debugger
        debugger;
      }

      if (is3to4(formatIn)) {
        const accessor = name + '3to4';
        program.push(makeStorageAccessor(namespace, set, base, to4(formatIn), to4(formatIn), accessor, readWrite));
        program.push(makeVec3to4Accessor(namespace, formatOut, to3(formatIn), name, accessor));
        continue;
      }
      else if (is8to32(formatIn)) {
        const accessor = name + '8to32';
        program.push(makeStorageAccessor(namespace, set, base, 'u32', 'u32', accessor, readWrite));
        program.push(make8to32Accessor(namespace, formatOut, to32(formatIn), name, accessor));
        continue;
      }
      else if (is16to32(formatIn)) {
        const accessor = name + '16to32';
        program.push(makeStorageAccessor(namespace, set, base, 'u32', 'u32', accessor, readWrite));
        program.push(make16to32Accessor(namespace, formatOut, to32(formatIn), name, accessor));
        continue;
      }
      else if (isVec8to32(formatIn)) {
        const accessor = name + 'Vec8to32';
        const wide = to32(formatIn).replace('i32', 'u32');
        program.push(makeStorageAccessor(namespace, set, base, 'u32', 'u32', accessor, readWrite));
        program.push(makeVec8to32Accessor(namespace, formatOut, wide, name, accessor));
        continue;
      }
      else if (isVec16to32(formatIn)) {
        const accessor = name + 'Vec16to32';
        const wide = to32(formatIn).replace('i32', 'u32');
        program.push(makeStorageAccessor(namespace, set, base, 'u32', 'u32', accessor, readWrite));
        program.push(makeVec16to32Accessor(namespace, formatOut, wide, name, accessor));
        continue;
      }

      program.push(makeStorageAccessor(namespace, set, base, formatOut, formatIn, name, readWrite, args));
    }

    for (const {uniform: {name, format: formatOut, args}, texture} of textures) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const {volatile, layout, variant, absolute, sampler, comparison, format: formatIn, aspect} = texture!;
      const set = volatile ? volatileSet : bindingSet;
      const base = volatile ? volatileBase++ : bindingBase++;
      if (sampler && args !== null) volatile ? volatileBase++ : bindingBase++;
      program.push(makeTextureAccessor(namespace, set, base, formatOut as string, formatIn, name, layout, variant, aspect, absolute, !!sampler, !!comparison, args));
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
    exports,
    modules: modules.length ? modules : undefined,
  }, undefined, hash, code, key);

  const bundle = Object.keys(libs).length ? {
    module: virtual,
    libs,
  } : virtual;

  const links: Record<string, ShaderModule> = {};
  for (const {uniform} of constants) links[uniform.name] = bundle;
  for (const {uniform} of storages)  links[uniform.name] = bundle;
  for (const {uniform} of textures)  links[uniform.name] = bundle;
  for (const {uniform, lambda} of lambdas)   {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const needsCast = !checkLambdaType(uniform, lambda!);
    links[uniform.name] = needsCast
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? castTo(lambda!.shader, uniform.format as string)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      : lambda!.shader;
  }

  return links;
};

export const checkLambdaType = (
  uniform: UniformAttribute,
  lambda: LambdaSource,
) => {
  const {name, format: from} = uniform;

  const bundle = toBundle(lambda.shader);
  const {format: to} = bundleToAttribute(bundle);

  if (Array.isArray(from) || Array.isArray(to)) return true;

  let f = from;
  let t = to;

  if (f === t) return true;
  if (t === 'auto') return true;
  if (t == null) {
    console.warn(`Unable to determine lambda format for uniform ${uniform.name} -> bundle ${getBundleEntry(bundle)}`)
    return true;
  }

  // Remove vec<..> to allow for automatic widening/narrowing
  f = f.replace(/vec[0-9]/, '').replace(/^<|>$/g, '');
  t = t.replace(/vec[0-9]/, '').replace(/^<|>$/g, '');

  // Shorthand
  if (f.match(/^vec[0-9]uif$/)) f += '32';
  if (f.match(/^vec[0-9]h$/))   f = 'f16';
  if (t.match(/^vec[0-9]uif$/)) t += '32';
  if (t.match(/^vec[0-9]h$/))   t = 'f16';

  if (f !== t) {
    // Remove bit size to allow for automatic widening/narrowing
    const fromScalar = f.replace(/([uif])([0-9]+)/, '$1__');
    const toScalar   = t.replace(/([uif])([0-9]+)/, '$1__');

    if (fromScalar !== toScalar) {
      // uppercase = struct type, allow any
      if (from.match(/[A-Z]/) && to) return true;

      throw new Error(`Invalid format ${to} bound for ${from} "${name}" (${fromScalar} != ${toScalar})`);
    }
  }

  return false;
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
) => (
`struct ${ns}Type {
  ${members.map(m => `${m},`).join('\n  ')}
};
@group(${set}) @binding(${binding}) var<uniform> ${ns}Uniform: ${ns}Type;
`);

export const makeUniformFieldAccessor = (
  uniform: string,
  ns: string,
  type: string,
  name: string,
  args: string[] | null = INT_ARG,
) => {
  if (args == null) throw new Error("Constants cannot be bound directly to storage/textures");
  return (
`fn ${ns}${name}(${args.map((t, i) => `${arg(i)}: ${t}`).join(', ')}) -> ${type} {
  return ${uniform}Uniform.${ns}${name};
}
`);
};

export const makeStorageAccessor = (
  ns: string,
  set: number | string,
  binding: number | string,
  type: string,
  format: string,
  name: string,
  readWrite?: boolean,
  args: string[] | null = INT_ARG,
) => {
  const access = readWrite ? 'storage, read_write' : 'storage';

  if (args === null) {
    return `@group(${set}) @binding(${binding}) var<${access}> ${ns}${name}: ${type};\n`;
  }

  const hasCast = needsCast(format, type);
  return (
`@group(${set}) @binding(${binding}) var<${access}> ${ns}${name}Storage: array<${format}>;

fn ${ns}${name}(${args.map((t, i) => `${arg(i)}: ${t}`).join(', ')}) -> ${type} {
  ${hasCast ? 'let v =' : 'return'} ${ns}${name}Storage[${args.length ? arg(0) : '0u'}];
${hasCast ? `  return ${makeSwizzle(format, type, 'v')};\n` : ''
}}
`);
}

export const makeTextureAccessor = (
  ns: string,
  set: number | string,
  binding: number,
  type: string,
  format: string,
  name: string,
  layout: string,
  variant: string = 'textureSample',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aspect: string = 'all',
  absolute: boolean = false,
  sampler: boolean = true,
  comparison: boolean = false,
  args: string[] | null = UV_ARG,
) => {
  if (args === null) {
    return `@group(${set}) @binding(${binding}) var ${ns}${name}: ${type};\n`;
  }

  const m = layout.match(/[0-9]/) ?? [2];
  const dims = +m[0];
  const dimsCast = dims === 1 ? 'f32' : `vec${dims}<f32>`;

  const t = layout.match(/<([^>]+)>/)?.[1] ?? 'f32';
  const shaderType = (
    layout.match(/depth/) ? 'f32' :
    `vec4<${t}>`
  );

  const hasCast = needsCast(shaderType, type);

  return (
`@group(${set}) @binding(${binding}) var ${ns}${name}Texture: ${layout};
${sampler ? `@group(${set}) @binding(${binding + 1}) var ${ns}${name}Sampler: ${comparison ? 'sampler_comparison' : 'sampler'};\n` : ''}
fn ${ns}${name}(${args.map((t, i) => `${arg(i)}: ${t}`).join(', ')}) -> ${type} {
  ${absolute ?
    `let relUV = ${arg(0)} / ${dimsCast}(textureDimensions(${ns}${name}Texture));\n  ` : ``
  }${hasCast ? 'let v =' : 'return'} ${variant}(${ns}${name}Texture, ${sampler ? `${ns}${name}Sampler, ` : ''}${args.map((_, i) => `${i === 0 && absolute ? 'relUV' : arg(i)}`).join(', ')});
${hasCast ? '  return ' + makeSwizzle(shaderType, type, 'v') + ';\n' : ''
}}
`)
};

export const makeVec3to4Accessor = (
  ns: string,
  type: string,
  format: string,
  name: string,
  accessor: string,
) => (
`fn ${ns}${name}(i: u32) -> ${type} {
  let i3 = i * 3u;
  let b = i3 / 4u;

  let b4 = b * 4u;
  let f3 = i3 - b4;

  let v1 = ${ns}${accessor}(b);
  let v2 = ${ns}${accessor}(b + 1u);

  var v: ${format};
  if (f3 == 0u) { v = v1.xyz; }
  else if (f3 == 1u) { v = v1.yzw; }
  else if (f3 == 2u) { v = ${format}(v1.zw, v2.x); }
  else { v = ${format}(v1.w, v2.xy); }

  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);

export const make8to32Accessor = (
  ns: string,
  type: string,
  format: string,
  name: string,
  accessor: string,
) => (
`fn ${ns}${name}(i: u32) -> ${type} {
  let b2 = i >> 2u;
  let f4 = i & 3u;

  let word = u32(${ns}${accessor}(b2));
  var v: ${format} = ${format}((word >> (f4 << 3u)) & 0xFFu);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);

export const make16to32Accessor = (
  ns: string,
  type: string,
  format: string,
  name: string,
  accessor: string,
) => (
`fn ${ns}${name}(i: u32) -> ${type} {
  let b2 = i >> 1u;
  let f2 = i & 1u;

  let word = u32(${ns}${accessor}(b2));
  var v: ${format} = ${format}((word >> (f2 << 4u)) & 0xFFFFu);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);

export const makeVec8to32Accessor = (
  ns: string,
  type: string,
  format: string,
  name: string,
  accessor: string,
) => {
  if (format.match(/^vec2/)) {
    return (
`fn ${ns}${name}(i: u32) -> ${type} {
  let i2 = i >> 1u;
  let f2 = i & 1u;
  let word = ${ns}${accessor}(i2);
  let short = word >> (f2 << 4u);
  let v = (vec2<u32>(short) >> vec2<u32>(0, 8)) & vec2<u32>(0xFF);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);
  }
  else {
    return (
`fn ${ns}${name}(i: u32) -> ${type} {
  let word = ${ns}${accessor}(i);
  let v = (vec4<u32>(word) >> vec4<u32>(0, 8, 16, 24)) & vec4<u32>(0xFF);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);
  }
}

export const makeVec16to32Accessor = (
  ns: string,
  type: string,
  format: string,
  name: string,
  accessor: string,
) => {
  if (format.match(/^vec2/)) {
    return (
`fn ${ns}${name}(i: u32) -> ${type} {
  let word = ${ns}${accessor}(i);
  let v = (vec2<u32>(word, word) >> vec2<u32>(0, 16)) & vec2<u32>(0xFFFF);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);
  }
  else {
    return (
`fn ${ns}${name}(i: u32) -> ${type} {
  let i2 = i * 2;
  let word1 = ${ns}${accessor}(i2);
  let word2 = ${ns}${accessor}(i2 + 1);
  let v = (vec4<u32>(word1, word1, word2, word2) >> vec4<u32>(0, 16, 0, 16)) & vec4<u32>(0xFFFF);
  return ${needsCast(format, type) ? makeSwizzle(format, type, 'v') : 'v'};
}
`);
  }
};
