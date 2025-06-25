import type {
  AggregateItem,
  ArrayAggregate,
  StructAggregate,
  ArrayAggregateBuffer,
  StructAggregateBuffer,
  StorageSource,
  UniformAttribute,
  UniformType,
  VectorEmitter,
  Lazy,
} from './types';

import { resolve } from './lazy';
import { makeStorageBuffer, uploadStorage } from './buffer';
import {
  castRawArray,
  makeRawArray,
  makeGPUArray,
  copyNumberArray,
  offsetNumberArray,
  spreadNumberArray,
} from './data';
import { makeUniformLayout, toCPUDims, toGPUDims } from './uniform';

/** Get a summary of a list of items to aggregate */
export const getAggregateSummary = (items: AggregateItem[]) => {
  const n = items.length;
  const archetype = items[0]?.archetype ?? 0;

  const indexOffsets = [];

  let allCount = 0;
  let allIndexed = 0;
  let allInstanced = 0;

  for (let i = 0; i < n; ++i) {
    const {count, indexed, instanced} = items[i];
    if (indexed != null) indexOffsets.push(allCount);
    allCount += count;
    allIndexed += indexed ?? count;
    allInstanced += instanced ?? 1;
  }

  return {archetype, count: allCount, indexed: allIndexed, instanced: allInstanced, offsets: indexOffsets};
};

/** CPU-only storage for GPU array attribute */
export const makeArrayAggregate = (
  format: UniformType,
  length: number,
): ArrayAggregate => makeGPUArray(format, length);

/** CPU-only array-of-struct GPU aggregate */
export const makeStructAggregate = (
  attributes: UniformAttribute[],
  length: number,
  keys?: string[],
): StructAggregate => {
  const layout = makeUniformLayout(attributes);

  const {length: bytes} = layout;
  const raw = makeRawArray(bytes * length);

  keys = keys ?? layout.attributes.map(({name}) => name);

  return {raw, layout, length, keys};
};

/** CPU+GPU storage for GPU array attribute */
export const makeArrayAggregateBuffer = (
  device: GPUDevice,
  format: UniformType,
  length: number,
): ArrayAggregateBuffer => {
  const {array, dims} = makeGPUArray(format, length);

  const buffer = makeStorageBuffer(device, array.byteLength);
  const source = {
    buffer,
    format,
    length,
    size: [length],
    version: 0,
  };

  return {buffer, source, array, length, dims, format: 'array<T>'};
}

/** CPU+GPU storage for array-of-struct GPU aggregate */
export const makeStructAggregateBuffer = (
  device: GPUDevice,
  attributes: UniformAttribute[],
  length: number,
  keys?: string[],
): StructAggregateBuffer => {

  const aggregate = makeStructAggregate(attributes, length, keys);
  const {layout} = aggregate;

  const buffer = makeStorageBuffer(device, aggregate.raw.byteLength);
  const source: StorageSource = {
    buffer,
    format: 'array<T>',
    length,
    size: [length],
    version: 0,

    minBindingSize: layout.length,
  };

  return {buffer, source, ...aggregate};
}

/** Extract array-of-struct fields as virtual arrays with >1 stride */
export const makeStructAggregateFields = (structAggregate: StructAggregate) => {
  const {layout: {length: layoutLength, attributes}, raw, length} = structAggregate;

  const out: Record<string, ArrayAggregate> = {};
  for (const {name, offset, format} of attributes) {
    const {array, dims} = castRawArray(raw, format as any);

    const elementSize = array.byteLength / array.length;
    const base = offset / elementSize;
    const stride = layoutLength / elementSize;

    if (base !== (base|0) || stride !== (stride|0)) throw new Error('Unaligned field data');

    out[name] = {
      array,
      dims,
      length,
      base,
      stride,
      format: format as any,
    };
  }
  return out;
};

/** Update an array aggregate with new data from a list of items */
export const updateAggregateArray = (
  aggregate: ArrayAggregateBuffer | ArrayAggregate,
  items: AggregateItem[],
  key: string,
  unwelded?: boolean,
  single?: boolean,
  offsets?: number[],
) => {
  const {array, dims, base, stride} = aggregate;

  // vec3/mat3 to vec4/mat4 extension
  // 3.5 = 3to4, 7.5 = 6to8, 11.5 = 9to12, 15.5 = 12to16
  const dimsIn = toCPUDims(dims);
  const dimsOut = toGPUDims(dims);
  const step = stride ?? dimsOut;

  let i = 0;
  let b = base || 0;
  for (const item of items) {
    const {
      count,
      indexed = count,
      instanced = 1,
      attributes: {
        [key]: values = 0,
      },
    } = item;

    const c = single ? instanced : unwelded ? indexed : count;

    if (typeof values === 'function') (values as VectorEmitter)(array, b, c, stride);
    else if (offsets) offsetNumberArray(values, array, offsets[i], dimsIn, dimsOut, 0, b, c, stride);
    else copyNumberArray(values, array, dimsIn, dimsOut, 0, b, c, stride);

    b += c * step;
    i++;
  }

  aggregate.length = b / dimsOut;
}

/** Update the instance index map of an aggregate */
export const updateAggregateInstances = (() => {
  const slices: number[] = [];

  return (
    aggregate: ArrayAggregate,
    items: AggregateItem[],
    count: number,
  ) => {
    const {array} = aggregate;

    for (const {count, indexed, slices: s} of items) {
      if (s) slices.push(...s);
      else slices.push(indexed ?? count);
    }

    spreadNumberArray(null, array, slices);
    aggregate.length = count;

    slices.length = 0;
  }
})();

/** Update an array aggregate with new data from a list of just-in-time refs */
export const updateAggregateRefs = (
  aggregate: ArrayAggregateBuffer | ArrayAggregate,
  refs: Lazy<any>[],
  count: number,
) => {
  const {array, dims, base, stride} = aggregate;
  const step = stride || dims;

  let b = base || 0;
  for (const ref of refs) {
    copyNumberArray(resolve(ref), array, toCPUDims(dims), toGPUDims(dims), 0, b, 1, stride);
    b += step;
  }

  aggregate.length = count;
}

/** Upload an aggregate's data to the GPU */
export const uploadAggregateBuffer = (
  device: GPUDevice,
  aggregate: ArrayAggregateBuffer | StructAggregateBuffer,
) => {
  const {array, raw, source, length} = aggregate as any;
  uploadStorage(device, source, raw ?? array.buffer, length);
  return source;
}
