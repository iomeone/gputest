import { vec2, vec3, mat4 } from 'gl-matrix';

export type Dictionary<T = string> = Record<string, T>;

export type DeepPartial<T> = T | {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type UseRenderingContextGPU = {
  width: number,
  height: number,
  pixelRatio: number,
  samples: number,

  device: GPUDevice,

  gpuContext: GPUCanvasContext,
  colorStates: GPUColorTargetState[],
  colorAttachments: GPURenderPassColorAttachment[],
  depthTexture: GPUTexture,
  depthStencilState: GPUDepthStencilState,
  depthStencilAttachment: GPURenderPassDepthStencilAttachment,
};

export type TypedArray =
  Int8Array |
  Uint8Array |
  Int16Array |
  Uint16Array |
  Int32Array |
  Uint32Array |
  Uint8ClampedArray |
  Float32Array |
  Float64Array;

export type TypedArrayConstructor =
  Int8ArrayConstructor |
  Uint8ArrayConstructor |
  Int16ArrayConstructor |
  Uint16ArrayConstructor |
  Int32ArrayConstructor |
  Uint32ArrayConstructor |
  Uint8ClampedArrayConstructor |
  Float32ArrayConstructor |
  Float64ArrayConstructor;

export enum UniformType {
  "bool" = "bool",
  "vec2<bool>" = "vec2<bool>",
  "vec3<bool>" = "vec3<bool>",
  "vec4<bool>" = "vec4<bool>",

  "u32" = "u32",
  "vec2<u32>" = "vec2<u32>",
  "vec3<u32>" = "vec3<u32>",
  "vec4<u32>" = "vec4<u32>",

  "i32" = "i32",
  "vec2<i32>" = "vec2<i32>",
  "vec3<i32>" = "vec3<i32>",
  "vec4<i32>" = "vec4<i32>",

  "f32" = "f32",
  "vec2<f32>" = "vec2<f32>",
  "vec3<f32>" = "vec3<f32>",
  "vec4<f32>" = "vec4<f32>",

  "f64" = "f64",
  "vec2<f64>" = "vec2<f64>",
  "vec3<f64>" = "vec3<f64>",
  "vec4<f64>" = "vec4<f64>",

  "mat2x2<f32>" = "mat2x2<f32>",
  "mat3x2<f32>" = "mat3x2<f32>",
  "mat2x3<f32>" = "mat2x3<f32>",
  "mat2x4<f32>" = "mat2x4<f32>",
  "mat4x2<f32>" = "mat4x2<f32>",
  "mat3x3<f32>" = "mat3x3<f32>",
  "mat3x4<f32>" = "mat3x4<f32>",
  "mat4x3<f32>" = "mat4x3<f32>",
  "mat4x4<f32>" = "mat4x4<f32>",

  "mat2x2<f64>" = "mat2x2<f64>",
  "mat3x2<f64>" = "mat3x2<f64>",
  "mat2x3<f64>" = "mat2x3<f64>",
  "mat2x4<f64>" = "mat2x4<f64>",
  "mat4x2<f64>" = "mat4x2<f64>",
  "mat3x3<f64>" = "mat3x3<f64>",
  "mat3x4<f64>" = "mat3x4<f64>",
  "mat4x3<f64>" = "mat4x3<f64>",
  "mat4x4<f64>" = "mat4x4<f64>",
};

// Vertex attributes
export type VertexData = {
  count: number,
  vertices: TypedArray[],
  attributes: GPUVertexBufferLayout[],
  index?: TypedArray,
  indexFormat?: GPUIndexFormat,
};

export type VertexAttribute = {
  name: string,
  format: GPUVertexFormat,
};

// Uniform buffers
export type UniformAttribute = {
  name: string,
  format: UniformType,
  args?: UniformType[],
};

export type UniformAttributeValue = UniformAttribute & {
  value: any,
};

export type UniformAttributeDescriptor = {
  name: string,
  offset: number,
  format: UniformType,
};

export type UniformLayout = {
  length: number,
  attributes: UniformAttributeDescriptor[],
  offsets: number[],
};

// Uniform bindings
export type UniformPipe = {
  layout: UniformLayout,
  data: ArrayBuffer,
  fill: UniformFiller,
};

export type UniformAllocation = {
  pipe: UniformPipe,
  buffer: GPUBuffer,
  bindGroup: GPUBindGroup,
};

export type ResourceAllocation = {
  bindGroup: GPUBindGroup,
};

export type VirtualAllocation = {
  pipe?: UniformPipe,
  buffer?: GPUBuffer,
  bindGroup?: GPUBindGroup,
};

export type UniformFiller = (items: any) => void;
export type UniformByteSetter = (view: DataView, offset: number, data: any) => void;

// Storage bindings
export type StorageSource = {
  buffer: GPUBuffer,
  format: string,
  length: number,
  version: number,
};

export type TextureSource = {
  view: GPUTexture | GPUTextureView,
  sampler: GPUSampler | GPUSamplerDescriptor,
  layout: string,
  format: string,
  size: [number, number] | [number, number, number],
  version: number,
};

export type DataTexture = {
  data: TypedArray,
  format: GPUTextureFormat,
  size: [number, number] | [number, number, number],
};

// Shaders
export type ShaderModuleDescriptor = {
  code: TypedArray | string,
  entryPoint: string,
  hash: string | number,
};

export type ShaderStageDescriptor = {
  module: GPUShaderModule,
  entryPoint: string,
};

// Projection pipeline
export type ViewUniforms = {
  projectionMatrix: { value: mat4 },
  viewMatrix: { value: mat4 },
  viewPosition: { value: vec3 | [number, number, number] | number[] },
  viewResolution: { value: vec2 | [number, number] | number[] },
  viewSize: { value: vec2 | [number, number] | number[] },
  viewWorldUnit: { value: number },
  viewPixelRatio: { value: number },
};

export type PickingUniforms = {
  pickingId: { value: number },
};

// Data

export type Emitter = (...args: number[]) => void;
export type Accessor = (o: any) => any;
export type EmitterExpression = (emit: Emitter, ...args: any[]) => any;

export type ArrayLike = any[] | TypedArray;

export type AccessorSpec = string | Accessor | ArrayLike;
export type DataField = [string, AccessorSpec];
export type DataBinding<T> = {
  uniform: UniformAttributeValue,
  storage?: StorageSource,
  texture?: TextureSource,
  constant?: any,
  lambda?: T,
};

export type AggregateBuffer = {
  buffer: GPUBuffer,
  array: TypedArray,
  dims: number,
  source: StorageSource,
};

// Passes

export enum RenderPassMode {
  Opaque = 'o',
  Transparent = 't',
  Picking = 'p',
  Debug = 'd',
};
