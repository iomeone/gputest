import { TYPED_ARRAYS, TEXTURE_FORMAT_SIZES, TEXTURE_FORMAT_DIMS } from './constants';
import { TypedArrayConstructor, TypedArray } from './types';

type BufferArray = TypedArray | number[] | ArrayBuffer | number;

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

  if (data) {
    const ArrayType = getTypedArrayConstructor(data);
    if (ArrayType) new ArrayType(buffer.getMappedRange()).set(data);
    buffer.unmap();
  }

  return buffer;
}

export const makeVertexBuffers = (device: GPUDevice, datas: TypedArray[]): GPUBuffer[] =>
  datas.map((data: TypedArray) => makeVertexBuffer(device, data));

export const makeVertexBuffer = (device: GPUDevice, data: TypedArray): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.VERTEX, data);

export const makeUniformBuffer = (device: GPUDevice, data: BufferArray): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

export const makeStorageBuffer = (device: GPUDevice, data: BufferArray): GPUBuffer =>
  makeTypedBuffer(device, getByteSize(data), GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);

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

  const n = bytesPerRow * height;
  const buffer = device.createBuffer({
    size: n,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  return [buffer, bytesPerRow, itemsPerRow, dimsPerItem];
}

export const uploadBuffer = (
  device: GPUDevice,
  buffer: GPUBuffer,
  data: ArrayBuffer,
): void => {
  // @ts-ignore
  device.queue.writeBuffer(buffer, 0, data, 0, data.byteLength);
}