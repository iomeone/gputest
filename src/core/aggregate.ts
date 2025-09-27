import { AggregateBuffer, UniformType } from './types';

import { makeStorageBuffer, uploadBuffer } from './buffer';
import {
  makeDataArray,
  copyNumberArrayRange,
  copyNumberArrayRepeatedRange,
  copyNumberArrayCompositeRange,
  generateChunkSegments,
} from './data';

export const makeAggregateBuffer = (device: GPUDevice, format: UniformType, length: number) => {
  const {array, dims} = makeDataArray(format, length);
  if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

  const buffer = makeStorageBuffer(device, array.byteLength);
  const source = {
    buffer,
    format,
    length,
    version: 0,
  };

  return {buffer, array, source, dims};
}

export const updateAggregateBuffer = (
  device: GPUDevice,
  aggregate: AggregateBuffer,
  items: Record<string, any>[],
  count: number,
  key: string,
  keys: string,
) => {
  const {buffer, array, source, dims} = aggregate;

  let pos = 0;
  for (const item of items) {
    const {count, [key]: single, [keys]: multiple} = item as any;

    if (multiple) copyNumberArrayCompositeRange(multiple, array, 0, pos, dims, count);
    else if (single) copyNumberArrayRepeatedRange(single, array, 0, pos, dims, count);

    pos += count * dims;
  }

  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}

export const updateAggregateSegments = (
  device: GPUDevice,
  segments: AggregateBuffer,
  chunks: number[],
  loops: boolean[],
  count: number,
) => {
  const {buffer, array, source, dims} = segments;

  generateChunkSegments(array, chunks, loops);
  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}

