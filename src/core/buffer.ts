import {TYPED_ARRAYS} from './constants';
import {TypedArrayConstructor, TypedArray} from './types';

export const getByteSize = (data: TypedArray | number): number => {
  if (+data === data) return +data;
  return (data as any).byteLength as number;
}

export const getTypedArrayConstructor = (t: TypedArray): TypedArrayConstructor => {
  for (const constructor of TYPED_ARRAYS) if (t instanceof constructor) return constructor;
  throw new Error("Unknown typed array");
}

export const makeVertexBuffers = (device: GPUDevice, datas: TypedArray[]): GPUBuffer[] =>
  datas.map((data: TypedArray) => makeVertexBuffer(device, data));

export const makeVertexBuffer = (device: GPUDevice, data: TypedArray): GPUBuffer => {
  const vertices = device.createBuffer({
    size: getByteSize(data),
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  const ArrayType = getTypedArrayConstructor(data);
  if (ArrayType) new ArrayType(vertices.getMappedRange()).set(data);

  vertices.unmap();

  return vertices;
}

export const makeUniformBuffer = (device: GPUDevice, data: TypedArray | number): GPUBuffer =>
  device.createBuffer({
    size: getByteSize(data),
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

export const makeStorageBuffer = (device: GPUDevice, data: TypedArray | number): GPUBuffer =>
  device.createBuffer({
    size: getByteSize(data),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

export const uploadBuffer = (
  device: GPUDevice,
  buffer: GPUBuffer,
  data: ArrayBuffer,
): void => {
  // @ts-ignore
  device.queue.writeBuffer(buffer, 0, data, 0, data.byteLength);
}