import type {
  UniformAllocation, VirtualAllocation, VolatileAllocation, GlobalAllocation,
  UniformAttribute, UniformLayout, UniformType,
  UniformPipe, UniformByteSetter, UniformFiller, UniformDataSetter, UniformValueSetter,
  TypedArrayConstructor,
  DataBinding,
} from './types';
import { UNIFORM_ATTRIBUTE_SIZES, UNIFORM_ATTRIBUTE_ALIGNS, UNIFORM_ARRAY_TYPES, UNIFORM_ARRAY_DIMS } from './constants';
import { UNIFORM_BYTE_SETTERS, repeatSetter } from './bytes';

import { getObjectKey, toMurmur53, mixBits53 } from '@use-gpu/state';
import { makeBindGroupLayout } from './bindgroup';
import { makeUniformBuffer } from './buffer';
import { makeSampler } from './texture';
import { alignSizeTo } from './data';
import { resolve } from './lazy';

const NO_BINDINGS = {} as any;
const unreachableFormat = (format: string) => { throw new Error(`Unimplemented uniform format '${format}'`); }

const RE_VEC_TYPE = /^(vec[0-9])+/;
const RE_ARRAY_TYPE = /^array</;

export const isUniformVecType = (type: string) => RE_VEC_TYPE.test(type);
export const isUniformArrayType = (type: string) => RE_ARRAY_TYPE.test(type);

export const getUniformArrayLength = (type: string): number => +(type.match(/^(?:array<)(?:.*),\s*([0-9]+)\s*>$/)?.[1] || 0);
export const getUniformArrayDepth = (type: string): number => (type.match(/^(array<)+/)?.[0]?.length || 0) / 6;
export const getUniformElementType = (type: string): string =>
  isUniformArrayType(type)
  ? getUniformElementType(type.replace(/^array<(.*?)(,[^>]*)?>$/, '$1'))
  : type;

export const toTypeString = (t: string | any): string => {
  if (typeof t === 'string') return t;
  if (t.entry != null) return `T<${t.entry}>`;
  if (t.module?.entry != null) return `T<${t.module.entry}>`;
  if (t.name != null) return t.name;
  if (t.type != null) return toTypeString(t.type);
  if (Array.isArray(t)) return `[${t.map(toTypeString).join(',')}]`;
  return 'void';
};

export const toCPUDims = (dims: number): number => dims !== Math.round(dims) ? Math.ceil(dims) * 3 / 4 : dims;
export const toGPUDims = (dims: number): number => Math.ceil(dims);

export const getUniformDims = (format: UniformType): number => UNIFORM_ARRAY_DIMS[format];
export const getUniformSize = (format: UniformType): number => UNIFORM_ATTRIBUTE_SIZES[format];
export const getUniformAlign = (format: UniformType): number => UNIFORM_ATTRIBUTE_ALIGNS[format];
export const getUniformByteSetter = (format: UniformType): UniformByteSetter => (UNIFORM_BYTE_SETTERS as any)[format];
export const getUniformArrayType = (format: UniformType): TypedArrayConstructor => UNIFORM_ARRAY_TYPES[format];

export const getUniformArrayByteSetter = (format: string): UniformByteSetter => {
  const isArray = isUniformArrayType(format);
  if (isArray) {
    const el = getUniformElementType(format) as UniformType;
    const n = getUniformArrayLength(format);
    const stride = getUniformSize(el);

    return repeatSetter(getUniformByteSetter(el), n, stride);
  }
  else  {
    return getUniformByteSetter(format as UniformType);
  }
};

export const getUniformArraySize = (format: UniformType, length: number): number => {
  const size = getUniformSize(format);
  return alignSizeTo(length * size, 4);
};

export const makeGlobalUniforms = (
  device: GPUDevice,
  uniformGroups: UniformAttribute[][],
): GlobalAllocation => {
  const VISIBILITY_ALL = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;

  const group = uniformGroups.map((_, binding) => ({binding, visibility: VISIBILITY_ALL, buffer: {}}));
  const layout = makeBindGroupLayout(device, group);

  const pipe = makeMultiUniformPipe(uniformGroups);
  const buffer = makeUniformBuffer(device, pipe.data);

  const {layout: {offsets}} = pipe;
  const bindings = offsets.map((offset) => ({buffer, offset}));

  const label = uniformGroups.flatMap(attributes => attributes.map(u => u.name)).join(' ');
  const entries = makeResourceEntries(bindings);

  const bindGroup = device.createBindGroup({
    label,
    layout,
    entries,
  });
  layout.label = label;

  return {pipe, buffer, layout, bindGroup};
}

export const makeUniforms = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  attributes: UniformAttribute[],
  set: number = 0,
): UniformAllocation => {
  const pipe = makeUniformPipe(attributes);
  const buffer = makeUniformBuffer(device, pipe.data);
  const entries = makeResourceEntries([{buffer}]);

  const label = attributes.map(u => u.name).join(' ');
  const bindGroup = device.createBindGroup({
    label,
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return {pipe, buffer, bindGroup};
}

export const makeMultiUniforms = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  uniformGroups: UniformAttribute[][],
  set: number = 0,
): UniformAllocation => {
  const pipe = makeMultiUniformPipe(uniformGroups);
  const buffer = makeUniformBuffer(device, pipe.data);

  const {layout: {offsets}} = pipe;
  const bindings = offsets.map((offset) => ({buffer, offset}));

  const label = uniformGroups.flatMap(attributes => attributes.map(u => u.name)).join(' ');
  const entries = makeResourceEntries(bindings);
  const bindGroup = device.createBindGroup({
    label,
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });

  return {pipe, buffer, bindGroup};
}

export const makeBoundUniforms = <T>(
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  uniforms: DataBinding<T>[],
  bindings: DataBinding<T>[],
  set: number = 0,
  force?: boolean,
  label: string = 'BoundUniforms',
): VirtualAllocation => {
  const hasBindings = !!bindings.length;
  const hasUniforms = !!uniforms.length;

  if (!hasBindings && !hasUniforms && !force) return NO_BINDINGS;

  const entries = [] as GPUBindGroupEntry[];
  let pipe, buffer;

  if (hasBindings) {
    const bindingEntries = bindings.length ? makeDataBindingsEntries(device, bindings, 0) : [];
    entries.push(...bindingEntries);
  }

  if (hasUniforms) {
    const struct = uniforms.map(({attribute}) => attribute);
    pipe = makeUniformPipe(struct);
    buffer = makeUniformBuffer(device, pipe.data);

    const uniformEntries = makeResourceEntries([{buffer}], entries.length);
    entries.push(...uniformEntries);
  }

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
    label,
  });

  return {pipe, buffer, bindGroup};
}

export const makeVolatileUniforms = <T>(
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  bindings: DataBinding<T>[],
  set: number = 0,
  label: string = 'VolatileUniforms',
): VolatileAllocation => {
  const hasBindings = !!bindings.length;
  if (!hasBindings) return NO_BINDINGS;

  const depths = [];
  for (const b of bindings) {
    if (b.storage?.volatile) depths.push(+b.storage.volatile);
    else if (b.texture?.volatile) depths.push(+b.texture.volatile);
  }
  const depth = depths.length > 1 ? lcm(depths) : depths[0];

  if (depth === 1) {
    let lastKey = -1;
    let cached: GPUBindGroup | null = null;

    const bindGroup = () => {

      let key = 0;
      for (const b of bindings) {
        let v: any = undefined;
        if (b.texture) v = b.texture.view ?? b.texture.texture;
        else if (b.storage) v = b.storage.buffer;

        key = mixBits53(key, getObjectKey(v));
      }

      if (key === lastKey && cached) return cached;

      const entries = bindings.length ? makeDataBindingsEntries(device, bindings, 0) : [];
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(set),
        entries,
        label,
      });

      cached = bindGroup;
      lastKey = key;

      return bindGroup;
    };

    return {bindGroup};
  }

  const cache = miniLRU<GPUBindGroup>(depth);

  const ids: number[] = [];
  const bindGroup = () => {
    ids.length = 0;
    for (const b of bindings) {
      let v: any = undefined;
      if (b.texture) v = b.texture.view ?? b.texture.texture;
      else if (b.storage) v = b.storage.buffer;

      ids.push(getObjectKey(v));
    }

    const key = toMurmur53(ids);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const entries = bindings.length ? makeDataBindingsEntries(device, bindings, 0) : [];
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(set),
      entries,
    });

    cache.set(key, bindGroup);
    return bindGroup;
  };

  return {bindGroup};
}

export const getTextureDimension = (layout: string): GPUTextureViewDimension | undefined => {
  if (!layout) return undefined;

  const type = layout.match(/[1-3]d|cube/)?.[0];
  if (!type) return undefined;

  return (layout.match(/array/) ? type + '-array' : type) as GPUTextureViewDimension;
};

export const makeDataBindingsEntries = <T>(
  device: GPUDevice,
  bindings: (DataBinding<T> | Omit<DataBinding<T>, 'attribute'> | null)[],
  binding: number = 0,
): GPUBindGroupEntry[] => {
  const entries = [] as any[];
  
  for (const b of bindings) {
    if (!b) binding++;
    else if (b.uniform) {
      const {uniform} = b;
      entries.push({binding, resource: {
        buffer: uniform.buffer,
        offset: uniform.byteOffset,
        size:   uniform.byteLength,
      }});
      binding++;
    }
    else if (b.storage) {
      const {storage} = b;
      entries.push({binding, resource: {
        buffer: storage.buffer,
        offset: storage.byteOffset,
        size:   storage.byteLength,
      }});
      binding++;
    }
    else if (b.texture) {
      const {texture} = b;
      const {texture: t, view, sampler, layout, aspect} = texture;
      const hasSampler = sampler && (b as any).attribute?.args !== null;

      const textureResource = view ?? t.createView({
        mipLevelCount: 1,
        baseMipLevel: 0,
        dimension: getTextureDimension(layout),
        aspect,
      });
      entries.push({binding, resource: textureResource});
      binding++;

      if (hasSampler) {
        const samplerResource = (sampler instanceof GPUSampler)
          ? sampler
          : makeSampler(device, {...sampler, label: (b as any).attribute?.name});

        entries.push({binding, resource: samplerResource});
        binding++;
      }
    }
    else if (b.sampler) {
      const {sampler: {sampler}} = b;
      const samplerResource = (sampler instanceof GPUSampler)
        ? sampler
        : makeSampler(device, {...sampler, label: (b as any).attribute?.name});

      entries.push({binding, resource: samplerResource});
      binding++;
    }
    
    if (b?.skip) { debugger; throw new Error("deprecated: skip"); }
  }

  return entries;
};

export const makeUniformPipe = (
  attributes: UniformAttribute[],
  count: number = 1,
): UniformPipe => {
  const layout = makeUniformLayout(attributes);
  const data = makeLayoutData(layout, count);
  const {fill} = makeLayoutFiller(layout, data);

  return {layout, data, fill};
}

export const makeMultiUniformPipe = (
  uniformGroups: UniformAttribute[][],
  count: number = 1,
): UniformPipe => {
  const layout = makeMultiUniformLayout(uniformGroups);
  const data = makeLayoutData(layout, count);
  const {fill} = makeLayoutFiller(layout, data);

  return {layout, data, fill};
}

export const makeResourceEntries = (
  bindings: GPUBindingResource[],
  binding: number = 0,
): GPUBindGroupEntry[] => {
  const entries = [] as any[];

  for (const resource of bindings) {
    entries.push({binding, resource});
    binding++;
  }

  return entries;
};

export const makePackedLayout = (
  attributes: UniformAttribute[],
  align: number = 1,
): UniformLayout => {
  const out = [] as any[];

  let offset = 0;
  for (const {name, format} of attributes) {
    if (typeof format === 'object') throw new Error(`Struct cannot be used as uniform member types`);

    let s = 0;

    const f = format as UniformType;
    const isArray = isUniformArrayType(f);
    if (isArray) {
      const el = getUniformElementType(f) as UniformType;
      const n = getUniformArrayLength(f) || 0;

      if (n == 0 || el == null) unreachableFormat(f);
      s = alignSizeTo(getUniformSize(el), align) * n;
    }
    else {
      s = getUniformSize(f);
    }

    const o = alignSizeTo(offset, align);
    out.push({name, offset: o, format: f});
    offset = o + s;
  }

  const s = alignSizeTo(offset, align);
  return {length: s, attributes: out, offsets: [0]};
};

export const makeUniformLayout = (
  attributes: UniformAttribute[],
  base: number = 0,
): UniformLayout => {
  const out = [] as any[];

  let max = 0;
  let offset = base;
  for (const {name, format} of attributes) {
    if (typeof format === 'object') throw new Error(`Struct cannot be used as uniform member types`);

    let s = 0;
    let a = 0;

    const f = format as UniformType;
    const isArray = isUniformArrayType(f);
    if (isArray) {
      const el = getUniformElementType(f) as UniformType;
      const n = getUniformArrayLength(f) || 0;

      if (n == 0 || el == null) unreachableFormat(f);

      a = getUniformAlign(el);
      s = alignSizeTo(getUniformSize(el), a) * n;
    }
    else {
      a = getUniformAlign(f);
      s = getUniformSize(f);
    }

    if (!a) throw new Error(`Type ${format} is not host-shareable or unimplemented`);

    const o = alignSizeTo(offset, a);
    out.push({name, offset: o, format});
    max = Math.max(max, a);

    offset = o + s;
  }

  const a = alignSizeTo(offset, max);
  return {length: a - base, attributes: out, offsets: [base]};
};

export const makeMultiUniformLayout = (
  uniformGroups: UniformAttribute[][],
  base: number = 0,
  alignment: number = 256,
): UniformLayout => {
  const out = [] as any[];
  const offsets = [];

  let offset = base;
  for (const attributes of uniformGroups) {
    const {length, attributes: attr} = makeUniformLayout(attributes, offset);
    out.push(...attr);
    offsets.push(offset);
    offset += length;

    offset = alignSizeTo(offset, alignment);
  }

  return {length: offset - base, attributes: out, offsets};
};

export const makeLayoutData = (
  layout: UniformLayout,
  count: number = 1,
  extra: number = 0,
): ArrayBuffer => {
  const {length} = layout;
  const data = new ArrayBuffer(length * count + extra);
  return data;
}

export const makeLayoutFiller = (
  layout: UniformLayout,
  data: ArrayBuffer,
): {
  fill: UniformFiller,
  setData: UniformDataSetter,
  setValue: UniformValueSetter,
} => {
  const {length, attributes} = layout;

  const dataView = new DataView(data);

  const fieldNameMap = new Map<string, number>();
  for (const [i, attr] of attributes.entries()) fieldNameMap.set(attr.name, i);

  const setters = attributes.map(attr => {
    const {offset, format} = attr;
    const setter = getUniformArrayByteSetter(format as string);
    return (view: DataView, base: number, value: any) => setter(view, base + offset, value);
  });

  const setValue = (index: number, field: number, value: any) => {
    const base = index * length;
    const setter = setters[field];
    if (!setter) return;

    const v = resolve(value);
    if (v != null) setter(dataView, base, v);
  }

  const setData = (index: number, item: any) => {
    for (const k in item) {
      const field = fieldNameMap.get(k);
      if (field == null) continue;

      setValue(index, field, item[k])
    }
  }

  const fill = (items: any | any[]) => {
    let index = 0;
    if (!Array.isArray(items)) setData(index++, items);
    else for (const item of items) {
      setData(index++, item);
    }
    return index;
  };

  return {fill, setData, setValue};
}

const miniLRU = <T>(max: number) => {
  const keys   = [] as number[];
  const values = [] as T[];

  for (let i = 0; i < max; ++i) {
    keys.push(null as any);
    values.push(null as any);
  }

  let h = 0;
  return {
    get: (key: number) => {
      const i = keys.indexOf(key);
      return i >= 0 ? values[i] : null;
    },
    set: (key: number, value: T) => {
      keys[h] = key;
      values[h] = value;
      h = (h + 1) % max;
    },
  };
}

const lcm = (xs: number[]) => xs.reduce(mul) / xs.reduce(gcd);
const mul = (a: number, b: number) => a * b;
const gcd = (a: number, b: number) => {
  let max = Math.max(a, b);
  let min = Math.min(a, b);
  while (min) {
    const mod = max % min;
    max = min;
    min = mod;
  }
  return max;
}
