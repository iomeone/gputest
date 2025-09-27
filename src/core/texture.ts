import { DataTexture, DataBinding, TextureSource } from './types';
import { TYPED_ARRAYS, TEXTURE_FORMAT_SIZES, TEXTURE_FORMAT_DIMS } from './constants';

type Point = [number, number];
type Point3 = [number, number, number];

const NO_OFFSET = [0, 0, 0] as Point3;

export const makeSampler = (
  device: GPUDevice,
  descriptor?: Partial<GPUSamplerDescriptor>,
) => device.createSampler(descriptor);

export const makeTextureView = (
  texture: GPUTexture,
  mipLevelCount: number = 1,
  baseMipLevel: number = 0,
) =>
  texture.createView({
    mipLevelCount,
    baseMipLevel,
  });

export const makeRenderTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: [width, height, 1],
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return texture;
}

export const makeRenderableTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: [width, height, 1],
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING ,
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
    size: [width, height, 1],
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
    size: [width, height, depth],
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  return texture;
}

export const makeDynamicTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  depth: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const texture = device.createTexture({
    // @ts-ignore
    size: [width, height, depth],
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC,
  });

  return texture;
}

export const makeRawSourceTexture = (
  device: GPUDevice,
  dataTexture: DataTexture,
) => {
  const {size, format} = dataTexture;
  const [w, h, d] = size as Point3;

  return makeSourceTexture(device, w, h, d || 1, format, 1);
}

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

export const uploadDataTexture = (
  device: GPUDevice,
  texture: GPUTexture,
  dataTexture: DataTexture,
): void => {
  const {data, size, format} = dataTexture;

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
  const extent = [width, height, d || 1];

  const copy = {
    texture,
    mipLevel,
    origin,
    aspect,
  };

  // @ts-ignore
  device.queue.writeTexture(copy, data, layout, extent);
}

export const resizeTextureSource = (
  device: GPUDevice,
  source: TextureSource,
  width: number,
  height: number,
  depth: number = 1,
  mipLevel: GPUIntegerCoordinate = 0,
  aspect: GPUTextureAspect = "all",
) => {
  const {format} = source;
  const newTexture = makeDynamicTexture(device, width, height, depth, format as any, 1);

  const src = {
    texture: source.texture,
    origin: [0, 0, 0],
    mipLevel,
    aspect,
  };
  const dst = {
    texture: newTexture,
    origin: [0, 0, 0],
    mipLevel,
    aspect,
  }
  
  const [w, h, d] = source.size;
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyTextureToTexture(src, dst, [w, h, d || 1]);
  device.queue.submit([commandEncoder.finish()]);

  return {
    ...source,
    texture: newTexture,
    view: makeTextureView(newTexture),
    size: [width, height, depth],
    version: 1,
  };
}

export const makeTextureBinding = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  sampler: GPUSampler,
  texture: GPUTexture | GPUTextureView,
  set: number = 0,
): GPUBindGroup => {
  const view = (texture instanceof GPUTexture) ? makeTextureView(texture) : texture;

  const entries = [
    {binding: 0, resource: sampler},
    {binding: 1, resource: view},
  ];

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return bindGroup;
}

export const makeMultiTextureBinding = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  textures: [GPUSampler, GPUTexture | GPUTextureView][],
  set: number = 0,
): GPUBindGroup => {
  const entries = makeTextureEntries(textures);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return bindGroup;
}

export const makeTextureEntries = (
  textures: [GPUSampler, GPUTexture | GPUTextureView][],
  binding: number = 0
): GPUBindGroupEntry[] => {
  const entries = [] as any[];

  for (const [sampler, texture] of textures) {
    const view = (texture instanceof GPUTexture) ? makeTextureView(texture) : texture;

    entries.push({binding, resource: sampler});
    binding++;

    entries.push({binding, resource: view});
    binding++;
  }

  return entries;
};
