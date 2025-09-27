import { vec2, vec3, mat4 } from 'gl-matrix';

export type Point = [number, number];
export type Point3 = [number, number, number];
export type Point4 = [number, number, number, number];
export type Rectangle = [number, number, number, number];

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
  colorSpace: ColorSpace,
  colorInput: ColorSpace,
  colorStates: GPUColorTargetState[],
  colorAttachments: GPURenderPassColorAttachment[],
  depthTexture?: GPUTexture,
  depthStencilState?: GPUDepthStencilState,
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment,

  swapView: (view?: GPUTextureView) => void,
};

export type ColorSpace = 'linear' | 'srgb' | 'p3' | 'native' | 'picking' | 'auto';

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

export type UniformType =
  | "bool"
  | "vec2<bool>"
  | "vec3<bool>"
  | "vec4<bool>"

  | "u32"
  | "vec2<u32>"
  | "vec3<u32>"
  | "vec4<u32>"

  | "i32"
  | "vec2<i32>"
  | "vec3<i32>"
  | "vec4<i32>"

  | "f16"
  | "vec2<f16>"
  | "vec3<f16>"
  | "vec4<f16>"

  | "f32"
  | "vec2<f32>"
  | "vec3<f32>"
  | "vec4<f32>"

  | "f64"
  | "vec2<f64>"
  | "vec3<f64>"
  | "vec4<f64>"

  | "mat2x2<u32>"
  | "mat3x2<u32>"
  | "mat2x3<u32>"
  | "mat2x4<u32>"
  | "mat4x2<u32>"
  | "mat3x3<u32>"
  | "mat3x4<u32>"
  | "mat4x3<u32>"
  | "mat4x4<u32>"

  | "mat2x2<i32>"
  | "mat3x2<i32>"
  | "mat2x3<i32>"
  | "mat2x4<i32>"
  | "mat4x2<i32>"
  | "mat3x3<i32>"
  | "mat3x4<i32>"
  | "mat4x3<i32>"
  | "mat4x4<i32>"

  | "mat2x2<f16>"
  | "mat3x2<f16>"
  | "mat2x3<f16>"
  | "mat2x4<f16>"
  | "mat4x2<f16>"
  | "mat3x3<f16>"
  | "mat3x4<f16>"
  | "mat4x3<f16>"
  | "mat4x4<f16>"

  | "mat2x2<f32>"
  | "mat3x2<f32>"
  | "mat2x3<f32>"
  | "mat2x4<f32>"
  | "mat4x2<f32>"
  | "mat3x3<f32>"
  | "mat3x4<f32>"
  | "mat4x3<f32>"
  | "mat4x4<f32>"

  | "mat2x2<f64>"
  | "mat3x2<f64>"
  | "mat2x3<f64>"
  | "mat2x4<f64>"
  | "mat4x2<f64>"
  | "mat3x3<f64>"
  | "mat3x4<f64>"
  | "mat4x3<f64>"
  | "mat4x4<f64>"

  // Virtual types
  | "u8"
  | "i8"
  | "u16"
  | "i16"
  | "vec2<u8>"
  | "vec2<i8>"
  | "vec2<u16>"
  | "vec2<i16>"
  | "vec3<u8>"
  | "vec3<i8>"
  | "vec3<u16>"
  | "vec3<i16>"
  | "vec4<u8>"
  | "vec4<i8>"
  | "vec4<u16>"
  | "vec4<i16>"
  | "vec3to4<u8>"
  | "vec3to4<i8>"
  | "vec3to4<u16>"
  | "vec3to4<i16>"
  | "vec3to4<u32>"
  | "vec3to4<i32>"
  | "vec3to4<f32>"
;

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
  members?: UniformAttribute[],
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

export type ShaderStructType = {
  module: {entry: string}
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

export type VirtualAllocation = Partial<UniformAllocation>;

export type VolatileAllocation = {
  bindGroup?: () => GPUBindGroup,
};

export type UniformFiller = (items: any) => void;
export type UniformDataSetter = (index: number, item: any) => void;
export type UniformValueSetter = (index: number, field: number, value: any) => void;
export type UniformByteSetter = (view: DataView, offset: number, data: any) => void;

// Storage bindings
export type StorageSource = {
  buffer: GPUBuffer,
  format: any,
  length: number,
  size: number[],
  version: number,

  volatile?: number,
  byteOffset?: number,
  byteLength?: number,
  colorSpace?: ColorSpace,
};

export type LambdaSource<T = any> = {
  shader: T,
  length: number,
  size: number[],
  version: number,

  colorSpace?: ColorSpace,
};

export type TextureSource = {
  texture: GPUTexture,
  view?: GPUTextureView,
  sampler: GPUSampler | GPUSamplerDescriptor | null,
  layout: string,
  format: string,
  size: [number, number] | [number, number, number],
  version: number,

  mips?: number,
  variant?: string,
  args?: string[],
  absolute?: boolean,
  volatile?: number,
  colorSpace?: ColorSpace,
};

export type DataTexture = {
  data: TypedArray,
  size: [number, number] | [number, number, number],
  format?: GPUTextureFormat,
  colorSpace?: ColorSpace,
  layout?: string,
};

export type ExternalTexture = {
  format: GPUTextureFormat,
  size: [number, number] | [number, number, number],
  colorSpace?: ColorSpace,
  layout?: string,
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
  projectionMatrix: { current: mat4 },
  viewMatrix: { current: mat4 },
  viewPosition: { current: vec3 | [number, number, number] | number[] },
  viewNearFar: { current: vec2 | [number, number] | number[] },
  viewResolution: { current: vec2 | [number, number] | number[] },
  viewSize: { current: vec2 | [number, number] | number[] },
  viewWorldDepth: { current: vec2 | [number, number] | number[] },
  viewPixelRatio: { current: number },
};

export type PickingUniforms = {
  pickingId: { value: number },
};

// Data

export type ChunkLayout = {
  chunks: number[],
  indexed?: number[],
  offsets?: number[],
  loops?: boolean[],
  starts?: boolean[],
  ends?: boolean[],
  count: number,
};

export type Tuples<N extends number, T = number> = {
  array: T[],
  get: (i: number, j: number) => T,
  iterate: (f: (...args: T[]) => void, start?: number, end?: number) => void;
  dims: number,
  length: number,
};

export interface Emitter<T = Time> {
  (emit: Emit, ...args: any[]): any;
}

/*
export interface Emitter<T = Time> {
  (emit: Emit, i: number, props?: T): any;
  (emit: Emit, i: number, j: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, l: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, l: number, m: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, l: number, m: number, n: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, l: number, m: number, n: number, o: number, props?: T): any;
  (emit: Emit, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, props?: T): any;
  (emit: Emit, ...args: any[]): any;
};
*/

export type Emit = (...args: number[]) => void;
export type Accessor = (o: any) => any;
export type Time = {
  timestamp: number,
  elapsed: number,
  delta: number,
};

export type ArrayLike = any[] | TypedArray;

export type AccessorSpec = string | Accessor | ArrayLike;
export type AccessorType = 'index';
export type DataField = [string, AccessorSpec] | [string, AccessorSpec, AccessorType];
export type DataBinding<T = any, S = any> = {
  uniform: UniformAttribute,
  storage?: StorageSource,
  texture?: TextureSource,
  lambda?: LambdaSource<S>,
  constant?: Lazy<T>,
};

export type Lazy<T> = T | (() => T) | {expr: () => T} | {current: T};

export type AggregateBuffer = {
  buffer: GPUBuffer,
  array: TypedArray,
  source: StorageSource,
  dims: number,
};

export type Atlas = {
  place: (key: number, w: number, h: number) => Rectangle,
  map: Map<number, Rectangle>,
  width: number,
  height: number,
  uploads: Rectangle[][],
  version: number,
};

// Passes

export type RenderPassMode = 'opaque' | 'transparent' | 'picking' | 'debug';
