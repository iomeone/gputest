import {
  UniformAllocation, VirtualAllocation, ResourceAllocation,
  UniformAttribute, UniformAttributeDescriptor,
  UniformLayout, UniformType,
  UniformPipe, UniformByteSetter, UniformFiller,
  DataBinding,
  StorageSource,
  TextureSource,
} from './types';
import { UNIFORM_ATTRIBUTE_SIZES } from './constants';
import { UNIFORM_BYTE_SETTERS } from './bytes';
import { makeUniformBuffer } from './buffer';
import { makeSampler, makeTextureView } from './texture';

export const getUniformAttributeSize = (format: UniformType): number => UNIFORM_ATTRIBUTE_SIZES[format];
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
  const bindGroup = device.createBindGroup({
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

  const entries = makeResourceEntries(bindings);
  const bindGroup = device.createBindGroup({
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
): VirtualAllocation => {
  const entries = [] as GPUBindGroupEntry[];

  let pipe, buffer, bindGroup;

  const hasBindings = !!bindings.length;
  const hasUniforms = !!uniforms.length;

  if (!hasBindings && !hasUniforms) return {};

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

  if (entries.length) bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });

  return {pipe, buffer, bindGroup};
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
      entries.push({binding, resource: {buffer: storage.buffer}});
      binding++;
    }
    else if (b.texture) {
      const {texture} = b;
      const {view, sampler} = texture;
      
      const textureResource = (view instanceof GPUTextureView) ? view : makeTextureView(view);
      const samplerResource = (sampler instanceof GPUSampler) ? sampler : makeSampler(device, sampler);

      entries.push({binding, resource: samplerResource});
      binding++;

      entries.push({binding, resource: textureResource});
      binding++;
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
  const fill = makeLayoutFiller(layout, data);

  return {layout, data, fill};
}

export const makeMultiUniformPipe = (
  uniformGroups: UniformAttribute[][],
  count: number = 1,
): UniformPipe => {
  const layout = makeMultiUniformLayout(uniformGroups);
  const data = makeLayoutData(layout, count);
  const fill = makeLayoutFiller(layout, data);

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

  let offset = base;
  for (const {name, format} of uniforms) {
    const s = getUniformAttributeSize(format);

    const o = offset % s;
    if (o) offset += s - o;
    out.push({name, offset, format});

    offset += s;
  }

  return {length: offset - base, attributes: out, offsets: [base]};
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
    
    const d = offset % alignment;
    offset += d ? alignment - d : 0;
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
): UniformFiller => {
  const {length, attributes} = layout;

  const map = new Map<string, UniformAttributeDescriptor>();
  for (const attr of attributes) map.set(attr.name, attr);

  const dataView = new DataView(data);

  const setItem = (index: number, item: any) => {
    const base = index * length;
    for (let k in item) {
      const attr = map.get(k);
      if (!attr) continue;

      const {offset, format} = attr;
      const setter = getUniformByteSetter(format);

      const o = item[k];
      const v = (o && typeof o === 'object' && o.hasOwnProperty('value'))
        ? o.value : o;
      if (v != null) setter(dataView, base + offset, v);
    }
  }

  return (items: any) => {
    let index = 0;
    if (!Array.isArray(items)) setItem(index, items);
    else for (const item of items) {
      setItem(index++, item);
    }
  }
}
