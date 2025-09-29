import type { Rectangle, Point, Point3, TextureSource, VertexData } from './types';

import { makeVertexAttributeLayout } from './attribute';
import { makeColorAttachment, makeColorState } from './color';
import { makeVertexBuffer } from './buffer';
import { makeRenderPipeline, makeShaderModuleDescriptor } from './pipeline';
import { makeTextureBinding, makeSampler } from './texture';
import { seq } from './tuple';

const MIP_SHADER_2D = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(
  @location(0) uv: vec2<f32>,
) -> VertexOutput {
  return VertexOutput(
    vec4<f32>((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0), 0.5, 1.0),
    uv,
  );
}

@group(0) @binding(0) var mipTexture: texture_2d<f32>;
@group(0) @binding(1) var mipSampler: sampler;

@fragment
fn fragmentMain(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
  return textureSample(mipTexture, mipSampler, uv);
}
`;

const MIP_SHADER_2D_ARRAY = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(
  @location(0) uv: vec2<f32>,
) -> VertexOutput {
  return VertexOutput(
    vec4<f32>((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0), 0.5, 1.0),
    uv,
  );
}

@group(0) @binding(0) var mipTexture: texture_2d_array<f32>;
@group(0) @binding(1) var mipSampler: sampler;

@fragment
fn fragmentMain(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
  return textureSample(mipTexture, mipSampler, uv, 0);
}
`;

const MIP_UVS = makeVertexAttributeLayout([{ name: 'uv', format: 'float32x2' }]);

const makeMipMesh = (bounds: Rectangle[], size: Point | Point3): VertexData => {
  let i = 0;
  const [w, h] = size;

  const uvs = new Float32Array(bounds.length * 5 * 2);
  for (const [l, t, r, b] of bounds) {
    uvs[i++] = l / w;
    uvs[i++] = t / h;
    uvs[i++] = r / w;
    uvs[i++] = t / h;
    uvs[i++] = l / w;
    uvs[i++] = b / h;
    uvs[i++] = r / w;
    uvs[i++] = b / h;
    uvs[i++] = NaN;
    uvs[i++] = NaN;
  }

  const vertices   = [uvs];
  const attributes = [MIP_UVS];

  return {vertices, attributes, count: uvs.length / 2};
}

const NO_CLEAR = [0, 0, 0, 0] as Rectangle;
const MIP_PIPELINES = new WeakMap<GPUDevice, Map<string, GPURenderPipeline>>();

export const updateMipArrayTextureChain = (
  device: GPUDevice,
  source: TextureSource,
  bounds: (Rectangle[] | null) = null,
) => {
  const {size} = source;
  const [,, depth] = size;
  if (depth) seq(depth).map((layer: number) => updateMipTextureChain(device, source, bounds, layer));
}

export const updateMipTextureChain = (
  device: GPUDevice,
  source: TextureSource,
  bounds: (Rectangle[] | null) = null,
  layer: number | null = null,
) => {
  const {
    texture,
    format,
    layout,
    size,
    mips = 1,
  } = source;

  const [width, height] = size;
  const bs = bounds != null ? bounds : [[0, 0, width, height] as Rectangle];

  const mesh = makeMipMesh(bs, size);
  const vertexBuffer = makeVertexBuffer(device, mesh.vertices[0]);
  const sampler = makeSampler(device, {
    minFilter: 'linear',
    magFilter: 'linear',
  });

  const views = seq(mips).map((mip: number) => texture.createView({
    mipLevelCount: 1,
    arrayLayerCount: 1,
    baseMipLevel: mip,
    baseArrayLayer: layer ?? 0,
    dimension: layer != null ? '2d-array' : '2d',
  }));
  
  const renderPassDescriptors = seq(mips).map(i => ({
    colorAttachments: [makeColorAttachment(views[i], null, NO_CLEAR, 'load')],
  } as GPURenderPassDescriptor));

  let cache = MIP_PIPELINES.get(device);
  if (!cache) MIP_PIPELINES.set(device, cache = new Map());
  
  const key = [format, layout].join('/');
  let pipeline = cache.get(key);
  if (!pipeline) {
    const shader = layer != null ? MIP_SHADER_2D_ARRAY : MIP_SHADER_2D;

    const vertex = makeShaderModuleDescriptor(shader, 'mip-v', 'vertexMain');
    const fragment = makeShaderModuleDescriptor(shader, 'mip-f', 'fragmentMain');
    const colorStates = [makeColorState(format as GPUTextureFormat)];

    pipeline = makeRenderPipeline(device, vertex, fragment, colorStates, undefined, 1, {
      primitive: {
        topology: "triangle-strip",
      },
      vertex:   {buffers: mesh.attributes},
      fragment: {},
    });
    cache.set(key, pipeline);
  }

  const bindGroups = seq(mips).map((mip: number) => makeTextureBinding(device, pipeline!, views[mip], sampler));

  const commandEncoder = device.createCommandEncoder();
  for (let i = 1; i < mips; ++i) {
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptors[i]);
    passEncoder.setPipeline(pipeline!);
    passEncoder.setBindGroup(0, bindGroups[i - 1]);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(mesh.count, 1, 0, 0);
    passEncoder.end();    
  }

  device.queue.submit([commandEncoder.finish()]);
};
