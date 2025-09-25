import { AggregateBuffer, UniformType } from './types';

import { makeStorageBuffer, uploadBuffer } from './buffer';
import {
  makeDataArray,
  copyNumberArrayRange,
  copyNumberArrayRepeatedRange,
  copyNumberArrayCompositeRange,
  copyChunksToSegments,
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
  items: LayerAggregate[],
  count: number,
  key: string,
  keys: string,
) => {
  const {buffer, array, source, dims} = aggregate;

  let pos = 0;
  for (const item of items) {
    const {count, [key]: single, [keys]: multiple, isLoop} = item as any;

    if (multiple) copyNumberArrayCompositeRange(multiple, array, 0, pos, dims, count, isLoop);
    else if (single) copyNumberArrayRepeatedRange(single, array, 0, pos, dims, count, isLoop);

    const n = count + (isLoop ? 3 : 0);
    pos += n * dims;
  }

  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}

export const updateAggregateSegments = (
  device: GPUDevice,
  aggregate: AggregateBuffer,
  items: LayerAggregate[],
  count: number,
) => {
  const {buffer, array, source, dims} = aggregate;

  const chunks = [] as number[];
  const loops = [] as boolean[];

  for (const item of items) {
    const {count, isLoop} = item as any;
    chunks.push(count);
    loops.push(!!isLoop);
  }

  copyChunksToSegments(array, chunks, loops);
  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}
