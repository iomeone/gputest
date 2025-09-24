import { RawTexture } from './types';
import { TYPED_ARRAYS, TEXTURE_FORMAT_SIZES, TEXTURE_FORMAT_DIMS } from './constants';
import { makeUniformBindings } from './uniform';

type Point = [number, number];
type Point3 = [number, number, number];

const NO_OFFSET = [0, 0, 0] as Point3;

export const makeSampler = (
  device: GPUDevice,
  descriptor?: Partial<GPUSamplerDescriptor>,
) => device.createSampler(descriptor);

export const makeRenderTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: { width, height, depth: 1, depthOrArrayLayers: 1 },
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return texture;
}

export const makeReadbackTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: { width, height, depth: 1, depthOrArrayLayers: 1 },
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });

  return texture;
}

export const makeSourceTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  depth: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: { width, height, depth, depthOrArrayLayers: depth },
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  return texture;
}

export const makeRawSourceTexture = (
  device: GPUDevice,
  rawTexture: RawTexture,
) => {
  const {size, format} = rawTexture;
  const [w, h, d] = size as Point3;

  return makeSourceTexture(device, w, h, d || 1, format, 1);
}

export const makeTextureView = (
  texture: GPUTexture,
  mipLevelCounts: number = 1,
  baseMipLevel: number = 0,
) =>
  texture.createView({
    mipLevelCounts,
    baseMipLevel,
  });

export const makeTextureDataLayout = (
  size: Point | Point3,
  format: GPUTextureFormat,
) => {
  const [w, h, d] = size as Point3;

  const s = TEXTURE_FORMAT_SIZES[format] || 1;

  const bytesPerRow = s * w;
  const rowsPerImage = h;

  return {
    offset: 0,
    bytesPerRow,
    rowsPerImage,
  };
};

export const uploadRawTexture = (
  device: GPUDevice,
  texture: GPUTexture,
  rawTexture: RawTexture,
): void => {
  const {data, size, format} = rawTexture;

  const layout = makeTextureDataLayout(size, format);  
  uploadTexture(device, texture, data, layout, size);
}

export const uploadTexture = (
  device: GPUDevice,
  texture: GPUTexture,
  data: ArrayBuffer,
  layout: GPUImageDataLayout,
  size: Point | Point3,
  offset: Point | Point3 = NO_OFFSET,
  mipLevel: GPUIntegerCoordinate = 0,
  aspect: GPUTextureAspect = "all",
): void => {

  const [x, y, z] = offset as Point3;
  const origin = { x, y, z: z || 0 };

  const [width, height, d] = size as Point3;
  // @ts-ignore
  const extent = { width, height, depth: d || 1, depthOrArrayLayers: d || 1 };

  const copy = {
    texture,
    mipLevel,
    origin,
    aspect,
  };

  // @ts-ignore
  device.queue.writeTexture(copy, data, layout, extent);
}
