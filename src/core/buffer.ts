import type { StorageSource, TypedArrayConstructor, TypedArray, TensorArray } from './types';
import { TYPED_ARRAYS, TEXTURE_FORMAT_SIZES, TEXTURE_FORMAT_DIMS } from './constants';
import { incrementVersion } from './id';
import { LOGGING, decodeUsageFlags } from './debug';

type BufferArray = TypedArray | number[] | ArrayBuffer | number;

export const isTypedArray = (() => {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return (obj: any) => obj instanceof TypedArray;
})();

export const getByteSize = (data: BufferArray): number => {
  if (+data === data) return +data;
  return (data as any).byteLength as number;
}

export const getTypedArrayConstructor = (t: TypedArray): TypedArrayConstructor => {
  for (const constructor of TYPED_ARRAYS) if (t instanceof constructor) return constructor;
  throw new Error("Unknown typed array");
}

export const makeTypedBuffer = (
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags,
  data?: TypedArray,
): GPUBuffer => {
  const buffer = device.createBuffer({
    size,
    usage,
    mappedAtCreation: !!data,
  });

  LOGGING.buffer && console.warn('Allocate typed buffer', {size, ...decodeUsageFlags(usage)});

  if (data) {
    const ArrayType = getTypedArrayConstructor(data);
    if (ArrayType) new ArrayType(buffer.getMappedRange()).set(data);
    buffer.unmap();
  }

  return buffer;
}

export const makeDataBuffer = (device: GPUDevice, data: BufferArray, flags?: GPUBufferUsageFlags): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.COPY_DST | (flags || 0));

export const makeVertexBuffers = (device: GPUDevice, datas: TypedArray[], flags?: GPUBufferUsageFlags): GPUBuffer[] =>
  datas.map((data: TypedArray) => makeVertexBuffer(device, data, flags));

export const makeVertexBuffer = (device: GPUDevice, data: TypedArray, flags?: GPUBufferUsageFlags): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.VERTEX | (flags || 0), data);

export const makeUniformBuffer = (device: GPUDevice, data: BufferArray, flags?: GPUBufferUsageFlags): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | (flags || 0));

export const makeStorageBuffer = (device: GPUDevice, data: BufferArray, flags?: GPUBufferUsageFlags): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | (flags || 0));

export const makeIndirectBuffer = (device: GPUDevice, data: BufferArray, flags?: GPUBufferUsageFlags): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST | (flags || 0));

export const makeTextureReadbackBuffer = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
): [GPUBuffer, number, number, number] => {
  const s = TEXTURE_FORMAT_SIZES[format] || 1;
  const d = TEXTURE_FORMAT_DIMS[format] || 1;
  const minBytes = width * s;

  const partialBlock = minBytes % 256;
  const paddingSize = partialBlock ? 256 - partialBlock : 0;

  const bytesPerRow = minBytes + paddingSize;
  const itemsPerRow = bytesPerRow / s;
  const dimsPerItem = d;

  if (itemsPerRow !== Math.round(itemsPerRow)) throw new Error("Readback size not a multiple of item size");

  LOGGING.buffer && console.warn('Allocate readback buffer', {width, height, format});

  const n = bytesPerRow * height;
  const buffer = device.createBuffer({
    size: n,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  return [buffer, bytesPerRow, itemsPerRow, dimsPerItem];
}

export const clearBuffer = (
  device: GPUDevice,
  buffer: GPUBuffer,
  offset: number = 0,
  size?: number,
): void => {
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.clearBuffer(buffer, offset, size);

  const command = commandEncoder.finish();
  device.queue.submit([command]);
}

export const uploadBuffer = (
  device: GPUDevice,
  buffer: GPUBuffer,
  data: ArrayBuffer,
  offset: number = 0,
): void => {
  // @ts-ignore
  device.queue.writeBuffer(buffer, offset, data, 0, data.byteLength);
}

export const uploadBufferRange = (
  device: GPUDevice,
  buffer: GPUBuffer,
  data: ArrayBuffer,
  from: number,
  length: number,
  offset: number = 0,
): void => {
  // @ts-ignore
  device.queue.writeBuffer(buffer, offset + from, data, from, length);
}

export const uploadStorage = (
  device: GPUDevice,
  source: StorageSource,
  arrayBuffer: ArrayBuffer,
  count: number,
  size?: number[],
) => {
  uploadBuffer(device, source.buffer, arrayBuffer);

  if (size) source.size = size;
  else source.size = [count];

  source.length = count;
  source.version = incrementVersion(source.version);
};

export const updateTensor = (
  tensor: TensorArray,
  count: number,
  size?: number[],
) => {
  if (size) tensor.size = size;
  else tensor.size[0] = count;

  tensor.length = count;
  tensor.version = incrementVersion(tensor.version || 0);
};
