import { vec2, vec3, vec4, mat4 } from 'gl-matrix';

// Common vector types

export type XY = [number, number];
export type XYZ = [number, number, number];
export type XYZW = [number, number, number, number];
export type Rectangle = [number, number, number, number];

export type Color = vec4;
export type ColorLike = number | VectorLike | {rgb: VectorLike} | {rgba: VectorLike} | string;
export type ColorLikes = TypedArray | ColorLike[];

export type ArrayLike<T = any> = TypedArray | T[];
export type VectorLike = TypedArray | number[];
export type VectorLikes = TypedArray | VectorLike[];

export type Side = 'front' | 'back' | 'both';
export type Blending = 'none' | 'alpha' | 'premultiply' | 'add' | 'subtract' | 'multiply';
export type ColorSpace = 'linear' | 'srgb' | 'p3' | 'native' | 'picking' | 'auto';

export type RenderViewType = '2d' | 'cube';

export type FilteringType = 'filtering' | 'non-filtering' | 'comparison';

// JS utility types

export type ArrowFunction = (...args: any[]) => any;

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

export type ElementType<T> = T extends Array<infer E> ? E : never;

export type DeepPartial<T> = T | {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Lazy<T> = T | (() => T) | {expr: () => T} | {current: T};

// Rendering

export type UseGPURenderContext = {
  width: number,
  height: number,
  pixelRatio: number,
  samples: number,

  device: GPUDevice,
  gpuContext: GPUCanvasContext,
  colorSpace: ColorSpace,
  colorInput: ColorSpace,

  colorStates: GPUColorTargetState[],
  depthStencilState?: GPUDepthStencilState,

  viewType: RenderViewType,
  viewAttachments: RenderViewAttachment[],

  swap?: () => void,
  depth?: TextureSource,
  source?: TextureSource,
  sources?: TextureSource,
};

export type RenderViewAttachment = {
  colorAttachments: GPURenderPassColorAttachment[],
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment,
};

export type OffscreenRenderContext = UseGPURenderContext & {
  swap?: () => void,
  depth?: TextureTarget,
  source: TextureTarget,
};

/* @hidden */
export type OffscreenTarget = OffscreenRenderContext; // deprecated

// Simple backing-agnostic mesh geometry
export type CPUAttributes = Record<string, TypedArray>;
export type CPUGeometry = {
  archetype?: number,
  topology?: GPUPrimitiveTopology,
  bounds?: DataBounds,
  count: number,
  attributes: CPUAttributes,
  formats: Record<string, UniformType>,
  unwelded?: Record<string, boolean>,
};

export type GPUAttributes = Record<string, StorageSource | LambdaSource>;

export type GPUGeometry = {
  archetype?: number,
  topology?: GPUPrimitiveTopology,
  bounds?: DataBounds,
  count?: number,
  attributes: GPUAttributes,
  unwelded?: Record<string, boolean>,
};

// Classic vertex attributes.
// Unused because the types differ from uniforms.
export type VertexData = {
  count: number,
  vertices: TypedArray[],
  attributes: GPUVertexBufferLayout[],
  indices?: TypedArray,
  indexFormat?: GPUIndexFormat,
};

export type VertexAttribute = {
  name: string,
  format: GPUVertexFormat,
};

// Uniform buffers
export type UniformNamedType = 'T' | 'array<T>';
export type UniformFormat = UniformType | UniformAttribute[] | UniformNamedType;

export type UniformAttribute = {
  name: string,
  format: UniformFormat,
  type?: ShaderStructType,
  args?: UniformFormat[] | null,
  attr?: UniformShaderAttribute[],
  qual?: string,
};

export type UniformShaderAttribute = string;

export type UniformAttributeValue = UniformAttribute & {
  value: any,
};

export type UniformAttributeDescriptor = UniformAttribute & {
  offset: number,
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

export type GlobalAllocation = {
  pipe: UniformPipe,
  buffer: GPUBuffer,
  layout: GPUBindGroupLayout,
  bindGroup: GPUBindGroup,
};

export type ResourceAllocation = {
  bindGroup: GPUBindGroup,
};

export type VolatileAllocation = {
  bindGroup?: () => GPUBindGroup,
};

export type VirtualAllocation = Partial<UniformAllocation>;

export type UniformValues = Record<string, any>;
export type UniformFiller = (items: UniformValues | UniformValues[]) => void;
export type UniformDataSetter = (index: number, item: UniformValues) => void;
export type UniformValueSetter = (index: number, field: number, value: any) => void;
export type UniformByteSetter = (view: DataView, offset: number, data: any) => void;

// Shaders
export type ShaderStructType = ShaderModule & {entry?: string};

export type ShaderModule = {
  module?: Record<string, any>, // ParsedBundle
  table?: Record<string, any>,  // ParsedModule
  entry?: string,
};

export type ShaderModuleDescriptor = {
  code: TypedArray | string,
  label?: string,
  entryPoint: string,
  hash: string | number,
};

export type ShaderStageDescriptor = {
  module: GPUShaderModule,
  entryPoint: string,
};

// Shader data bindings
export type DataBinding<T = any, S extends ShaderModule = any> = {
  attribute: UniformAttribute,

  uniform?: UniformSource,
  storage?: StorageSource,
  texture?: TextureSource,
  sampler?: SamplerSource,

  lambda?: LambdaSource<S>,

  constant?: Lazy<T>,
};

export type DataBoundingBox = {min: VectorLike, max: VectorLike};
export type DataBounds = {
  center: VectorLike,
  radius: number,
  min: VectorLike,
  max: VectorLike,
};

export type LambdaSource<T extends ShaderModule = any> = {
  shader: T,
  length: number,
  size: VectorLike,
  version: number,

  bounds?: DataBounds,
  colorSpace?: ColorSpace,
};

export type TextureSource = {
  texture: GPUTexture,
  view?: GPUTextureView,
  sampler: GPUSampler | GPUSamplerDescriptor | null,
  layout: string,
  format: string,
  size: VectorLike,
  version: number,

  mips?: number,
  variant?: string,
  absolute?: boolean,
  volatile?: number,
  filter?: FilteringType,
  colorSpace?: ColorSpace,
  aspect?: GPUTextureAspect,
  hint?: string,
};

export type StorageSource<T extends ShaderModule = any> = {
  buffer: GPUBuffer,
  format: UniformFormat,
  type?: T,

  length: number,
  size: VectorLike,
  version: number,

  bounds?: DataBounds,
  volatile?: number,
  readWrite?: boolean,
  byteOffset?: number,
  byteLength?: number,
  colorSpace?: ColorSpace,

  addressSpace?: 'storage',
};

export type UniformSource<T extends ShaderModule = any> = {
  buffer: GPUBuffer,
  format: UniformFormat,
  type?: T,

  length: number,
  size: VectorLike,
  version: number,

  bounds?: DataBounds,
  volatile?: number,
  byteOffset?: number,
  byteLength?: number,
  colorSpace?: ColorSpace,

  addressSpace: 'uniform',
};

export type SamplerSource = {
  sampler: GPUSampler | GPUSamplerDescriptor | null,
  filter?: FilteringType,
};

export type StorageTarget = StorageSource & {
  history?: StorageSource[],
  swap: () => void,
};

export type TextureTarget = TextureSource & {
  history?: TextureSource[],
  swap: () => void,
};

export type DataTexture = {
  data: TypedArray,
  size: VectorLike,
  format?: GPUTextureFormat,
  colorSpace?: ColorSpace,
  layout?: string,
};

export type ExternalTexture = {
  format: GPUTextureFormat,
  size: VectorLike,
  colorSpace?: ColorSpace,
  layout?: string,
};

// Shader binding placeholders
export type RawBinding<T extends ShaderModule = any> = {
  attribute: UniformAttribute,

  uniform?: StoragePlaceholder<T>,
  storage?: StoragePlaceholder<T>,
  texture?: TexturePlaceholder,
  sampler?: SamplerSource,
};

export type StoragePlaceholder<T extends ShaderModule = any> = {
  format: UniformFormat,
  type?: T,
  readWrite?: boolean,
};

export type TexturePlaceholder = {
  sampler: GPUSampler | GPUSamplerDescriptor | null,
  layout: string,
  variant?: string,
  filter?: FilteringType,
};

// Projection pipeline
export type ViewUniforms = {
  projectionViewFrustum: { current: vec4[] },
  projectionViewMatrix: { current: mat4 },
  projectionMatrix: { current: mat4 },
  viewMatrix: { current: mat4 },
  inverseProjectionViewMatrix: { current: mat4 },
  inverseProjectionMatrix: { current: mat4 },
  inverseViewMatrix: { current: mat4 },
  viewPosition: { current: vec4 },
  viewNearFar: { current: vec2 },
  viewResolution: { current: vec2 },
  viewSize: { current: vec2 },
  viewWorldScale: { current: vec3 },
  viewPixelRatio: { current: number },
};

export type PickingUniforms = {
  pickingId: { value: number },
};

// Data ingestion

export type Tuples<N extends number, T = number> = {
  array: T[],
  dims: N,
  length: number,
  get: (i: number, j: number) => T,
  iterate: (f: (...args: T[]) => void, start?: number, end?: number) => void;
};

export type JSArray<T = any> = {
  array: T[],
  format: UniformType,
  dims: number,
  depth: number,
  length: number,
};

export type FieldArray = {
  array: TypedArray,
  format: UniformType | UniformNamedType,
  dims: number,
  length: number,

  depth?: number,
  prop?: string,
};

export type TensorArray = {
  array: TypedArray,
  format: UniformType,
  dims: number,
  length: number,
  size: VectorLike,
  ragged?: Ragged,

  version?: number,
};

export type Ragged = (number[] | TypedArray)[];

export type VectorEmitter = (to: TypedArray, count: number, toIndex?: number, stride?: number) => void;

export type Writer = {
  emit: Emit,
  emitted: () => number,
  reset: () => void,
};

export type Emit = <T extends any[] = any[]>(...args: T) => void;

export type Emitter<T extends any[] = any[]> = {
  (emit: Emit, ...args: T): void;
};

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

export type Time = {
  timestamp: number,
  elapsed: number,
  delta: number,
};

export type FromSchema<S extends DataSchema | ArchetypeSchema, T> = Record<keyof S, T>;

export type DataSchema = Record<string, string | DataField>;
export type DataField = {
  /** UniformType or array<…> or array<array<…>> */
  format: string,
  /** Prop name in input data */
  prop?: string,
  /** Is an index attribute */
  index?: boolean,
  /** Is an unwelded vertex attribute */
  unwelded?: boolean,
  /** Spread a singular to a plural attribute */
  spread?: string,
  /** Don't aggregate */
  separate?: boolean,
  /** Don't upload to GPU */
  js?: boolean,
};

export type ArchetypeSchema = Record<string, ArchetypeField>;
export type ArchetypeField = {
  /** UniformType or array<…> or array<array<…>> */
  format: string,
  /** Output attribute name */
  name?: string,
  /** Is an index attribute */
  index?: boolean,
  /** Is an unwelded vertex attribute */
  unwelded?: boolean,
  /** Spread a singular to a plural attribute */
  spread?: string,
  /** Instance attribute passed by ref just-in-time */
  ref?: boolean,
  /** Don't aggregate */
  separate?: boolean,
  /** Don't upload to GPU */
  js?: boolean,
};

export type AggregateValue = number | number[] | TypedArray | VectorEmitter;

export type AggregateItem = {
  archetype: number,
  count: number,
  indexed?: number,
  instanced?: number,

  attributes: Record<string, AggregateValue>,
  slices?: number[],
  refs?: Record<string, any>,
  flags?: Record<string, any>,
};

export type ArrayAggregate = FieldArray & {
  base?: number,
  stride?: number,
};

export type StructAggregate = {
  raw: ArrayBuffer,
  layout: UniformLayout,
  length: number,
  keys: string[],
};

export type CPUAggregate = {
  aggregateBuffers: Record<string, ArrayAggregate>,
  refBuffers: Record<string, Lazy<any>[]>,

  byJss?: { keys: [string, string][] },
  bySelfs?: { keys: [string, string][] },
  byInstances?: StructAggregate,
  byVertices?: StructAggregate,
  byIndices?: StructAggregate,
  byRefs?: StructAggregate,
};

export type GPUAggregate = {
  aggregateBuffers: Record<string, ArrayAggregateBuffer | ArrayAggregate>,
  refBuffers: Record<string, Lazy<any>[]>,

  byJss?: { keys: [string, string][], values: Record<string, any[]> },
  bySelfs?: { keys: [string, string][], sources: Record<string, StorageSource> },
  byInstances?: StructAggregateBuffer,
  byVertices?: StructAggregateBuffer,
  byIndices?: StructAggregateBuffer,
  byRefs?: StructAggregateBuffer,
};

export type ArrayAggregateBuffer = ArrayAggregate & {
  buffer: GPUBuffer,
  source: StorageSource,
};

export type StructAggregateBuffer = StructAggregate & {
  buffer: GPUBuffer,
  source: StorageSource,
};

/*-----*/

export type Atlas = {
  place: (key: number, w: number, h: number) => Rectangle,
  snug: () => ({width: number, height: number}),
  map: Map<number, Rectangle>,
  width: number,
  height: number,
  version: number,
};

// Passes

export type RenderPassMode = 'opaque' | 'transparent' | 'picking' | 'debug' | 'shadow';

// Uniform types

type RawUniformType =
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

  | "atomic<u32>"
  | "atomic<i32>"

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

export type UniformType = RawUniformType | `array<${RawUniformType}>` | `array<array<${RawUniformType}>>` | `array<array<array<${RawUniformType}>>>` | `string<u16>` | `array<string<u16>>`;
