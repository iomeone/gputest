import {TypedArrayConstructor, UniformType} from './types';

export const VALUE_TYPES = {
  'float': Float32Array,
  'double': Float64Array,
  'int': Int32Array,
  'uint': Uint32Array,
};

export const GLSL_TYPE_ALIASES = {
  'float2': 'vec2',
  'float3': 'vec3',
  'float4': 'vec4',
  'double2': 'dvec2',
  'double3': 'dvec3',
  'double4': 'dvec4',
  'int2': 'ivec4',
  'int3': 'ivec4',
  'int4': 'ivec4',
  'uint2': 'uvec4',
  'uint3': 'uvec4',
  'uint4': 'uvec4',
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

export const UNIFORM_SIZES = {
  "bool":    1,
  "bvec2":   2,
  "bvec3":   3,
  "bvec4":   4,

  "uint":    4,
  "uvec2":   8,
  "uvec3":   12,
  "uvec4":   16,

  "int":     4,
  "ivec2":   8,
  "ivec3":   12,
  "ivec4":   16,

  "float":   4,
  "vec2":    8,
  "vec3":    12,
  "vec4":    16,

  "double":  8,
  "dvec2":   16,
  "dvec3":   24,
  "dvec4":   32,

  "mat2":    16,
  "mat2x2":  16,
  "mat3x2":  24,
  "mat2x3":  24,
  "mat2x4":  32,
  "mat4x2":  32,
  "mat3":    36,
  "mat3x3":  36,
  "mat3x4":  48,
  "mat4x3":  48,
  "mat4":    64,
  "mat4x4":  64,

  "dmat2":   32,
  "dmat2x2": 32,
  "dmat3x2": 48,
  "dmat2x3": 48,
  "dmat2x4": 64,
  "dmat4x2": 64,
  "dmat3":   72,
  "dmat3x3": 72,
  "dmat3x4": 96,
  "dmat4x3": 96,
  "dmat4":   128,
  "dmat4x4": 128,
};

export const UNIFORM_DIMS = {
  "bool":    1,
  "bvec2":   2,
  "bvec3":   3,
  "bvec4":   4,

  "uint":    1,
  "uvec2":   2,
  "uvec3":   3,
  "uvec4":   4,

  "int":     1,
  "ivec2":   2,
  "ivec3":   3,
  "ivec4":   4,

  "float":   1,
  "vec2":    2,
  "vec3":    3,
  "vec4":    4,

  "double":  1,
  "dvec2":   2,
  "dvec3":   3,
  "dvec4":   4,

  "mat2":    4,
  "mat2x2":  4,
  "mat3x2":  6,
  "mat2x3":  6,
  "mat2x4":  8,
  "mat4x2":  8,
  "mat3":    9,
  "mat3x3":  9,
  "mat3x4":  12,
  "mat4x3":  12,
  "mat4":    16,
  "mat4x4":  16,

  "dmat2":    4,
  "dmat2x2":  4,
  "dmat3x2":  6,
  "dmat2x3":  6,
  "dmat2x4":  8,
  "dmat4x2":  8,
  "dmat3":    9,
  "dmat3x3":  9,
  "dmat3x4":  12,
  "dmat4x3":  12,
  "dmat4":    16,
  "dmat4x4":  16,
};

export const UNIFORM_ARRAY_TYPE = {
  "bool":    Uint32Array,
  "bvec2":   Uint32Array,
  "bvec3":   Uint32Array,
  "bvec4":   Uint32Array,

  "uint":    Uint32Array,
  "uvec2":   Uint32Array,
  "uvec3":   Uint32Array,
  "uvec4":   Uint32Array,

  "int":     Int32Array,
  "ivec2":   Int32Array,
  "ivec3":   Int32Array,
  "ivec4":   Int32Array,

  "float":   Float32Array,
  "vec2":    Float32Array,
  "vec3":    Float32Array,
  "vec4":    Float32Array,

  "double":  Float64Array,
  "dvec2":   Float64Array,
  "dvec3":   Float64Array,
  "dvec4":   Float64Array,

  "mat2":    Float32Array,
  "mat2x2":  Float32Array,
  "mat3x2":  Float32Array,
  "mat2x3":  Float32Array,
  "mat2x4":  Float32Array,
  "mat4x2":  Float32Array,
  "mat3":    Float32Array,
  "mat3x3":  Float32Array,
  "mat3x4":  Float32Array,
  "mat4x3":  Float32Array,
  "mat4":    Float32Array,
  "mat4x4":  Float32Array,

  "dmat2":   Float64Array,
  "dmat2x2": Float64Array,
  "dmat3x2": Float64Array,
  "dmat2x3": Float64Array,
  "dmat2x4": Float64Array,
  "dmat4x2": Float64Array,
  "dmat3":   Float64Array,
  "dmat3x3": Float64Array,
  "dmat3x4": Float64Array,
  "dmat4x3": Float64Array,
  "dmat4":   Float64Array,
  "dmat4x4": Float64Array,
};

// @ts-ignore
export const VERTEX_ATTRIBUTE_SIZES = VERTEX_SIZES as {[t in GPUVertexFormat]: number};

export const UNIFORM_ATTRIBUTE_SIZES = UNIFORM_SIZES as {[t in UniformType]: number};
