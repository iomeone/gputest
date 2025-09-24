import {TypedArrayConstructor, UniformType} from './types';

export const VALUE_TYPES = {
  // GLSL
  'float': Float32Array,
  'double': Float64Array,
  'int': Int32Array,
  'uint': Uint32Array,

  // WGSL
  'f32': Float32Array,
  'f64': Float64Array,
  'i32': Int32Array,
  'u32': Uint32Array,
};

export const TYPED_ARRAYS: TypedArrayConstructor[] = [
  Int8Array, Uint8Array,
  Int16Array, Uint16Array,
  Int32Array, Uint32Array,
  Uint8ClampedArray,
  Float32Array, Float64Array,
];

export const VERTEX_SIZES = {
  "uint8x2": 2,
  "uint8x4": 4,
  "sint8x2": 2,
  "sint8x4": 4,
  "unorm8x2": 2,
  "unorm8x4": 4,
  "snorm8x2": 2,
  "snorm8x4": 4,
  "uint16x2": 4,
  "uint16x4": 8,
  "sint16x2": 4,
  "sint16x4": 8,
  "unorm16x2": 4,
  "unorm16x4": 8,
  "snorm16x2": 4,
  "snorm16x4": 8,
  "float16x2": 4,
  "float16x4": 8,
  "float32": 4,
  "float32x2": 8,
  "float32x3": 12,
  "float32x4": 16,
  "uint32": 4,
  "uint32x2": 8,
  "uint32x3": 12,
  "uint32x4": 16,
  "sint32": 4,
  "sint32x2": 8,
  "sint32x3": 12,
  "sint32x4": 16,
};

export const VERTEX_TO_UNIFORM = {
  "uint8x2": "#!UNIMPLEMENTED",
  "uint8x4": "#!UNIMPLEMENTED",
  "sint8x2": "#!UNIMPLEMENTED",
  "sint8x4": "#!UNIMPLEMENTED",
  "unorm8x2": "#!UNIMPLEMENTED",
  "unorm8x4": "#!UNIMPLEMENTED",
  "snorm8x2": "#!UNIMPLEMENTED",
  "snorm8x4": "#!UNIMPLEMENTED",
  "uint16x2": "#!UNIMPLEMENTED",
  "uint16x4": "#!UNIMPLEMENTED",
  "sint16x2": "#!UNIMPLEMENTED",
  "sint16x4": "#!UNIMPLEMENTED",
  "unorm16x2": "#!UNIMPLEMENTED",
  "unorm16x4": "#!UNIMPLEMENTED",
  "snorm16x2": "#!UNIMPLEMENTED",
  "snorm16x4": "#!UNIMPLEMENTED",
  "float16x2": "#!UNIMPLEMENTED",
  "float16x4": "#!UNIMPLEMENTED",
  "float32": "float",
  "float32x2": "vec2",
  "float32x3": "vec3",
  "float32x4": "vec4",
  "uint32": "uint",
  "uint32x2": "uvec2",
  "uint32x3": "uvec3",
  "uint32x4": "uvec4",
  "sint32": "int",
  "sint32x2": "ivec2",
  "sint32x3": "ivec3",
  "sint32x4": "ivec4",
};

export const UNIFORM_SIZES = {
  "bool":         1,
  "vec2<bool>":   2,
  "vec3<bool>":   3,
  "vec4<bool>":   4,

  "u32":          4,
  "vec2<u32>":    8,
  "vec3<u32>":    12,
  "vec4<u32>":    16,

  "i32":          4,
  "vec2<i32>":    8,
  "vec3<i32>":    12,
  "vec4<i32>":    16,

  "f32":          4,
  "vec2<f32>":    8,
  "vec3<f32>":    12,
  "vec4<f32>":    16,

  "f64":          8,
  "vec2<f64>":    16,
  "vec3<f64>":    24,
  "vec4<f64>":    32,

  "mat2x2<f32>":  16,
  "mat3x2<f32>":  24,
  "mat2x3<f32>":  24,
  "mat2x4<f32>":  32,
  "mat4x2<f32>":  32,
  "mat3x3<f32>":  36,
  "mat3x4<f32>":  48,
  "mat4x3<f32>":  48,
  "mat4x4<f32>":  64,

  "mat2x2<f64>": 32,
  "mat3x2<f64>": 48,
  "mat2x3<f64>": 48,
  "mat2x4<f64>": 64,
  "mat4x2<f64>": 64,
  "mat3x3<f64>": 72,
  "mat3x4<f64>": 96,
  "mat4x3<f64>": 96,
  "mat4x4<f64>": 128,
};

export const UNIFORM_DIMS = {
  "bool":         1,
  "vec2<bool>":   2,
  "vec3<bool>":   3,
  "vec4<bool>":   4,

  "u32":          1,
  "vec2<u32>":    2,
  "vec3<u32>":    3,
  "vec4<u32>":    4,

  "i32":          1,
  "vec2<i32>":    2,
  "vec3<i32>":    3,
  "vec4<i32>":    4,

  "f32":          1,
  "vec2<f32>":    2,
  "vec3<f32>":    3,
  "vec4<f32>":    4,

  "f64":          1,
  "vec2<f64>":    2,
  "vec3<f64>":    3,
  "vec4<f64>":    4,

  "mat2x2<f32>":  4,
  "mat3x2<f32>":  6,
  "mat2x3<f32>":  6,
  "mat2x4<f32>":  8,
  "mat4x2<f32>":  8,
  "mat3x3<f32>":  9,
  "mat3x4<f32>":  12,
  "mat4x3<f32>":  12,
  "mat4x4<f32>":  16,

  "mat2x2<f64>":  4,
  "mat3x2<f64>":  6,
  "mat2x3<f64>":  6,
  "mat2x4<f64>":  8,
  "mat4x2<f64>":  8,
  "mat3x3<f64>":  9,
  "mat3x4<f64>":  12,
  "mat4x3<f64>":  12,
  "mat4x4<f64>":  16,
};

export const UNIFORM_ARRAY_TYPES = {
  "bool":         Uint32Array,
  "vec2<bool>":   Uint32Array,
  "vec3<bool>":   Uint32Array,
  "vec4<bool>":   Uint32Array,

  "u32":          Uint32Array,
  "vec2<u32>":    Uint32Array,
  "vec3<u32>":    Uint32Array,
  "vec4<u32>":    Uint32Array,

  "i32":          Int32Array,
  "vec2<i32>":    Int32Array,
  "vec3<i32>":    Int32Array,
  "vec4<i32>":    Int32Array,

  "f32":          Float32Array,
  "vec2<f32>":    Float32Array,
  "vec3<f32>":    Float32Array,
  "vec4<f32>":    Float32Array,

  "f64":          Float64Array,
  "vec2<f64>":    Float64Array,
  "vec3<f64>":    Float64Array,
  "vec4<f64>":    Float64Array,

  "mat2x2<f32>":  Float32Array,
  "mat3x2<f32>":  Float32Array,
  "mat2x3<f32>":  Float32Array,
  "mat2x4<f32>":  Float32Array,
  "mat4x2<f32>":  Float32Array,
  "mat3x3<f32>":  Float32Array,
  "mat3x4<f32>":  Float32Array,
  "mat4x3<f32>":  Float32Array,
  "mat4x4<f32>":  Float32Array,

  "mat2x2<f64>": Float64Array,
  "mat3x2<f64>": Float64Array,
  "mat2x3<f64>": Float64Array,
  "mat2x4<f64>": Float64Array,
  "mat4x2<f64>": Float64Array,
  "mat3x3<f64>": Float64Array,
  "mat3x4<f64>": Float64Array,
  "mat4x3<f64>": Float64Array,
  "mat4x4<f64>": Float64Array,
};

export const TEXTURE_FORMAT_SIZES = {
  // 8-bit formats
  "r8unorm": 1,
  "r8snorm": 1,
  "r8uint": 1,
  "r8sint": 1,

  // 16-bit formats
  "r16uint": 2,
  "r16sint": 2,
  "r16float": 2,
  "rg8unorm": 2,
  "rg8snorm": 2,
  "rg8uint": 2,
  "rg8sint": 2,

  // 32-bit formats
  "r32uint": 4,
  "r32sint": 4,
  "r32float": 4,
  "rg16uint": 4,
  "rg16sint": 4,
  "rg16float": 4,
  "rgba8unorm": 4,
  "rgba8unorm-srgb": 4,
  "rgba8snorm": 4,
  "rgba8uint": 4,
  "rgba8sint": 4,
  "bgra8unorm": 4,
  "bgra8unorm-srgb": 4,
  // Packed 32-bit formats
  "rgb9e5ufloat": 4,
  "rgb10a2unorm": 4,
  "rg11b10ufloat": 4,

  // 64-bit formats
  "rg32uint": 8,
  "rg32sint": 8,
  "rg32float": 8,
  "rgba16uint": 8,
  "rgba16sint": 8,
  "rgba16float": 8,

  // 128-bit formats
  "rgba32uint": 16,
  "rgba32sint": 16,
  "rgba32float": 16,

  // Depth and stencil formats
  "stencil8": 1,
  "depth16unorm": 2,
  "depth24plus": 4,
  "depth24plus-stencil8": 4,
  "depth32float": 4,

  /*
  // BC compressed formats usable if "texture-compression-bc" is both
  // supported by the device/user agent and enabled in requestDevice.
  "bc1-rgba-unorm",
  "bc1-rgba-unorm-srgb",
  "bc2-rgba-unorm",
  "bc2-rgba-unorm-srgb",
  "bc3-rgba-unorm",
  "bc3-rgba-unorm-srgb",
  "bc4-r-unorm",
  "bc4-r-snorm",
  "bc5-rg-unorm",
  "bc5-rg-snorm",
  "bc6h-rgb-ufloat",
  "bc6h-rgb-float",
  "bc7-rgba-unorm",
  "bc7-rgba-unorm-srgb",

  // ETC2 compressed formats usable if "texture-compression-etc2" is both
  // supported by the device/user agent and enabled in requestDevice.
  "etc2-rgb8unorm",
  "etc2-rgb8unorm-srgb",
  "etc2-rgb8a1unorm",
  "etc2-rgb8a1unorm-srgb",
  "etc2-rgba8unorm",
  "etc2-rgba8unorm-srgb",
  "eac-r11unorm",
  "eac-r11snorm",
  "eac-rg11unorm",
  "eac-rg11snorm",

  // ASTC compressed formats usable if "texture-compression-astc" is both
  // supported by the device/user agent and enabled in requestDevice.
  "astc-4x4-unorm",
  "astc-4x4-unorm-srgb",
  "astc-5x4-unorm",
  "astc-5x4-unorm-srgb",
  "astc-5x5-unorm",
  "astc-5x5-unorm-srgb",
  "astc-6x5-unorm",
  "astc-6x5-unorm-srgb",
  "astc-6x6-unorm",
  "astc-6x6-unorm-srgb",
  "astc-8x5-unorm",
  "astc-8x5-unorm-srgb",
  "astc-8x6-unorm",
  "astc-8x6-unorm-srgb",
  "astc-8x8-unorm",
  "astc-8x8-unorm-srgb",
  "astc-10x5-unorm",
  "astc-10x5-unorm-srgb",
  "astc-10x6-unorm",
  "astc-10x6-unorm-srgb",
  "astc-10x8-unorm",
  "astc-10x8-unorm-srgb",
  "astc-10x10-unorm",
  "astc-10x10-unorm-srgb",
  "astc-12x10-unorm",
  "astc-12x10-unorm-srgb",
  "astc-12x12-unorm",
  "astc-12x12-unorm-srgb",

  // "depth24unorm-stencil8" feature
  "depth24unorm-stencil8",

  // "depth32float-stencil8" feature
  "depth32float-stencil8",
  */
} as Record<GPUTextureFormat, number>;

export const TEXTURE_FORMAT_DIMS = {
  // 8-bit formats
  "r8unorm": 1,
  "r8snorm": 1,
  "r8uint": 1,
  "r8sint": 1,

  // 16-bit formats
  "r16uint": 1,
  "r16sint": 1,
  "r16float": 1,
  "rg8unorm": 2,
  "rg8snorm": 2,
  "rg8uint": 2,
  "rg8sint": 2,

  // 32-bit formats
  "r32uint": 1,
  "r32sint": 1,
  "r32float": 1,
  "rg16uint": 2,
  "rg16sint": 2,
  "rg16float": 2,
  "rgba8unorm": 4,
  "rgba8unorm-srgb": 4,
  "rgba8snorm": 4,
  "rgba8uint": 4,
  "rgba8sint": 4,
  "bgra8unorm": 4,
  "bgra8unorm-srgb": 4,
  // Packed 32-bit formats
  "rgb9e5ufloat": 1,
  "rgb10a2unorm": 1,
  "rg11b10ufloat": 1,

  // 64-bit formats
  "rg32uint": 2,
  "rg32sint": 2,
  "rg32float": 2,
  "rgba16uint": 4,
  "rgba16sint": 4,
  "rgba16float": 4,

  // 128-bit formats
  "rgba32uint": 4,
  "rgba32sint": 4,
  "rgba32float": 4,

  // Depth and stencil formats
  "stencil8": 1,
  "depth16unorm": 1,
  "depth24plus": 1,
  "depth24plus-stencil8": 1,
  "depth32float": 1,
} as Record<GPUTextureFormat, number>;

export const TEXTURE_ARRAY_TYPES = {
  // 8-bit formats
  "r8unorm": Uint8Array,
  "r8snorm": Int8Array,
  "r8uint": Uint8Array,
  "r8sint": Int8Array,

  // 16-bit formats
  "r16uint": Uint16Array,
  "r16sint": Int16Array,
  "r16float": Uint16Array,
  "rg8unorm": Uint8Array,
  "rg8snorm": Int8Array,
  "rg8uint": Uint8Array,
  "rg8sint": Int8Array,

  // 32-bit formats
  "r32uint": Uint32Array,
  "r32sint": Int32Array,
  "r32float": Float32Array,
  "rg16uint": Uint16Array,
  "rg16sint": Int16Array,
  "rg16float": Uint16Array,
  "rgba8unorm": Uint8Array,
  "rgba8unorm-srgb": Uint8Array,
  "rgba8snorm": Uint8Array,
  "rgba8uint": Uint8Array,
  "rgba8sint": Int8Array,
  "bgra8unorm": Uint8Array,
  "bgra8unorm-srgb": Uint8Array,
  // Packed 32-bit formats
  "rgb9e5ufloat": Uint32Array,
  "rgb10a2unorm": Uint32Array,
  "rg11b10ufloat": Uint32Array,

  // 64-bit formats
  "rg32uint": Uint32Array,
  "rg32sint": Uint32Array,
  "rg32float": Float32Array,
  "rgba16uint": Uint16Array,
  "rgba16sint": Uint16Array,
  "rgba16float": Uint16Array,

  // 128-bit formats
  "rgba32uint": Uint32Array,
  "rgba32sint": Uint32Array,
  "rgba32float": Float32Array,

  // Depth and stencil formats
  "stencil8": Uint8Array,
  "depth16unorm": Uint16Array,
  "depth24plus": Uint32Array,
  "depth24plus-stencil8": Uint32Array,
  "depth32float": Uint32Array,
} as Record<GPUTextureFormat, TypedArrayConstructor>;

// @ts-ignore
export const VERTEX_ATTRIBUTE_SIZES = VERTEX_SIZES as {[t in GPUVertexFormat]: number};

export const UNIFORM_ATTRIBUTE_SIZES = UNIFORM_SIZES as {[t in UniformType]: number};

// Standard blends
export const BLEND_NONE = undefined;

export const BLEND_ALPHA = {
  color: {
    operation: "add",
    srcFactor: "src-alpha",
    dstFactor: "one-minus-src-alpha",
  },
  alpha: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",      
  },
} as any as GPUBlendState;

export const BLEND_PREMULTIPLIED = {
  color: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",
  },
  alpha: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",      
  },
} as any as GPUBlendState;
