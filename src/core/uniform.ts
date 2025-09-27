import type {
  UniformAllocation, VirtualAllocation, VolatileAllocation, ResourceAllocation,
  UniformAttribute, UniformAttributeDescriptor,
  UniformLayout, UniformType,
  UniformPipe, UniformByteSetter, UniformFiller, UniformDataSetter, UniformValueSetter,
  DataBinding,
  StorageSource,
  TextureSource,
  Lazy,
} from './types';
import { UNIFORM_ATTRIBUTE_SIZES, UNIFORM_ATTRIBUTE_ALIGNS } from './constants';
import { UNIFORM_BYTE_SETTERS } from './bytes';

import { getObjectKey, toMurmur53 } from '@use-gpu/state';
import { makeUniformBuffer } from './buffer';
import { makeSampler, makeTextureView } from './texture';
import { alignSizeTo } from './data';

export const resolve = <T>(x: Lazy<T>): T => {
  if (typeof x === 'function') return (x as any)();
  if (typeof x === 'object' && x != null) {
    if ('expr' in x) return x.expr();
    if ('current' in x) return x.current;
  }
  return x;
};

export const getUniformAttributeSize = (format: UniformType): number => UNIFORM_ATTRIBUTE_SIZES[format];
export const getUniformAttributeAlign = (format: UniformType): number => UNIFORM_ATTRIBUTE_ALIGNS[format];
export const getUniformByteSetter = (format: UniformType): UniformByteSetter => UNIFORM_BYTE_SETTERS[format];

export const makeUniforms = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  uniforms: UniformAttribute[],
  set: number = 0,
): UniformAllocation => {
  const pipe = makeUniformPipe(uniforms);
  const buffer = makeUniformBuffer(device, pipe.data);
  const entries = makeResourceEntries([{buffer}]);

  const label = uniforms.map(u => u.name).join(' ');
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

  const label = uniformGroups.flatMap(uniforms => uniforms.map(u => u.name)).join(' ');
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
): VirtualAllocation => {
  const hasBindings = !!bindings.length;
  const hasUniforms = !!uniforms.length;

  if (!hasBindings && !hasUniforms && !force) return {};

  const entries = [] as GPUBindGroupEntry[];
  let pipe, buffer;

  if (hasBindings) {
    const bindingEntries = bindings.length ? makeDataBindingsEntries(device, bindings, 0) : [];
    entries.push(...bindingEntries);
  }

  if (hasUniforms) {
    const struct = uniforms.map(({uniform}) => uniform);
    pipe = makeUniformPipe(struct);
    buffer = makeUniformBuffer(device, pipe.data);

    const uniformEntries = makeResourceEntries([{buffer}], entries.length);
    entries.push(...uniformEntries);
  }

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });

  return {pipe, buffer, bindGroup};
}

export const makeVolatileUniforms = <T>(
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  bindings: DataBinding<T>[],
  set: number = 0,
): VolatileAllocation => {
  const hasBindings = !!bindings.length;
  if (!hasBindings) return {};

  let depth = 1;
  for (const b of bindings) {
    if (b.storage?.volatile) depth = Math.max(depth, +b.storage.volatile);
    else if (b.texture?.volatile) depth = Math.max(depth, +b.texture.volatile);
  }

  const cache = miniLRU<GPUBindGroup>(depth + 1);

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

export const makeDataBindingsEntries = <T>(
  device: GPUDevice,
  bindings: DataBinding<T>[],
  binding: number = 0,
): GPUBindGroupEntry[] => {
  const entries = [] as any[];
  
  for (const b of bindings) {
    if (b.storage) {
      const {storage} = b;
      entries.push({binding, resource: {
        buffer:     storage.buffer,
        offset:     storage.byteOffset,
        byteLength: storage.byteLength,
      }});
      binding++;
    }
    else if (b.texture) {
      const {texture} = b;
      const {texture: t, view, sampler} = texture;

      const textureResource = view ?? makeTextureView(t);
      const samplerResource = sampler ? ((sampler instanceof GPUSampler) ? sampler : makeSampler(device, sampler)) : null;

      entries.push({binding, resource: textureResource});
      binding++;

      if (sampler) {
        entries.push({binding, resource: samplerResource});
        binding++;
      }
    }
  }

  return entries;
};

export const makeUniformPipe = (
  uniforms: UniformAttribute[],
  count: number = 1,
): UniformPipe => {
  const layout = makeUniformLayout(uniforms);
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

export const makeUniformLayout = (
  uniforms: UniformAttribute[],
  base: number = 0,
): UniformLayout => {
  const out = [] as any[];

  let max = 0;
  let offset = base;
  for (const {name, format} of uniforms) {
    const s = getUniformAttributeSize(format);
    const a = getUniformAttributeAlign(format);
    if (a === 0) throw new Error(`Type ${format} is not host-shareable or unimplemented`);

    const o = alignSizeTo(offset, a);
    out.push({name, offset: o, format});
    max = Math.max(max, a);

    offset = o + s;
  }

  const s = alignSizeTo(offset, max);
  return {length: s - base, attributes: out, offsets: [base]};
};

export const makeMultiUniformLayout = (
  uniformGroups: UniformAttribute[][],
  base: number = 0,
  alignment: number = 256,
): UniformLayout => {
  const out = [] as any[];
  const offsets = [];

  let offset = base;
  for (const uniforms of uniformGroups) {
    const {length, attributes} = makeUniformLayout(uniforms, offset);
    out.push(...attributes);
    offsets.push(offset);
    offset += length;

    offset = alignSizeTo(offset, alignment);
  }

  return {length: offset - base, attributes: out, offsets};
};

export const makeLayoutData = (
  layout: UniformLayout,
  count: number = 1,
): ArrayBuffer => {
  const {length} = layout;
  const data = new ArrayBuffer(length * count);
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

  const map = new Map<string, UniformAttributeDescriptor>();
  for (const attr of attributes) map.set(attr.name, attr);

  const dataView = new DataView(data);

  const setValue = (index: number, field: number, value: any) => {
    const base = index * length;
    const attr = attributes[field];
    if (!attr) return;

    const {offset, format} = attr;
    const setter = getUniformByteSetter(format);

    const o = value;
    const v = resolve(o);
    if (v != null) setter(dataView, base + offset, v);
  }

  const setData = (index: number, item: any) => {
    const base = index * length;
    for (let k in item) {
      const attr = map.get(k);
      if (!attr) continue;

      const {offset, format} = attr;
      const setter = getUniformByteSetter(format);

      const o = item[k];
      const v = resolve(o);
      if (v != null) setter(dataView, base + offset, v);
    }
  }

  const fill = (items: any) => {
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