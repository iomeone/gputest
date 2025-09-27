export const setUint8  = (view: DataView, offset: number, value: number): void => view.setUint8(offset, value);
export const setUint16 = (view: DataView, offset: number, value: number): void => view.setUint16(offset, value, true);
export const setUint32 = (view: DataView, offset: number, value: number): void => view.setUint32(offset, value, true);

export const setInt8   = (view: DataView, offset: number, value: number): void => view.setInt8(offset, value);
export const setInt16  = (view: DataView, offset: number, value: number): void => view.setInt16(offset, value, true);
export const setInt32  = (view: DataView, offset: number, value: number): void => view.setInt32(offset, value, true);

const setFloat32 = (view: DataView, offset: number, value: number): void => view.setFloat32(offset, value, true);
const setFloat64 = (view: DataView, offset: number, value: number): void => view.setFloat64(offset, value, true);

export const setUint8N = (n: number) => (view: DataView, offset: number, data: Uint8Array): void => {
  for (let i = 0; i < n; ++i) setUint8(view, offset + i, data[i]);
};

export const setInt8N = (n: number) => (view: DataView, offset: number, data: Int8Array): void => {
  for (let i = 0; i < n; ++i) setInt8(view, offset + i, data[i]);
};

export const setUint16N = (n: number) => (view: DataView, offset: number, data: Uint16Array): void => {
  for (let i = 0; i < n; ++i) setUint16(view, offset + i * 2, data[i]);
};

export const setInt16N = (n: number) => (view: DataView, offset: number, data: Int16Array): void => {
  for (let i = 0; i < n; ++i) setInt16(view, offset + i * 2, data[i]);
};

export const setUint32N = (n: number) => (view: DataView, offset: number, data: Uint32Array): void => {
  for (let i = 0; i < n; ++i) setUint32(view, offset + i * 4, data[i]);
};

export const setInt32N = (n: number) => (view: DataView, offset: number, data: Int32Array): void => {
  for (let i = 0; i < n; ++i) setInt32(view, offset + i * 4, data[i]);
};

export const setFloat32N = (n: number) => (view: DataView, offset: number, data: Float32Array): void => {
  for (let i = 0; i < n; ++i) setFloat32(view, offset + i * 4, data[i]);
};

export const setFloat64N = (n: number) => (view: DataView, offset: number, data: Float64Array): void => {
  for (let i = 0; i < n; ++i) setFloat64(view, offset + i * 8, data[i]);
};

export const UNIFORM_BYTE_SETTERS = {
  "bool":             setUint8,
  "vec2<bool>":       setUint8N(2),
  "vec3<bool>":       setUint8N(3),
  "vec4<bool>":       setUint8N(4),

  "u32":              setUint32,
  "vec2<u32>":        setUint32N(2),
  "vec3<u32>":        setUint32N(3),
  "vec4<u32>":        setUint32N(4),

  "i32":              setInt32,
  "vec2<i32>":        setInt32N(2),
  "vec3<i32>":        setInt32N(3),
  "vec4<i32>":        setInt32N(4),

  "f16":              setUint16,
  "vec2<f16>":        setUint16N(2),
  "vec3<f16>":        setUint16N(3),
  "vec4<f16>":        setUint16N(4),

  "f32":              setFloat32,
  "vec2<f32>":        setFloat32N(2),
  "vec3<f32>":        setFloat32N(3),
  "vec4<f32>":        setFloat32N(4),

  "f64":              setFloat64,
  "vec2<f64>":        setFloat64N(2),
  "vec3<f64>":        setFloat64N(3),
  "vec4<f64>":        setFloat64N(4),

  "mat2x2<u32>":      setUint32N(4),
  "mat3x2<u32>":      setUint32N(6),
  "mat2x3<u32>":      setUint32N(6),
  "mat2x4<u32>":      setUint32N(8),
  "mat4x2<u32>":      setUint32N(8),
  "mat3x3<u32>":      setUint32N(9),
  "mat3x4<u32>":      setUint32N(12),
  "mat4x3<u32>":      setUint32N(12),
  "mat4x4<u32>":      setUint32N(16),

  "mat2x2<i32>":      setInt32N(4),
  "mat3x2<i32>":      setInt32N(6),
  "mat2x3<i32>":      setInt32N(6),
  "mat2x4<i32>":      setInt32N(8),
  "mat4x2<i32>":      setInt32N(8),
  "mat3x3<i32>":      setInt32N(9),
  "mat3x4<i32>":      setInt32N(12),
  "mat4x3<i32>":      setInt32N(12),
  "mat4x4<i32>":      setInt32N(16),

  "mat2x2<f16>":      setUint16N(4),
  "mat3x2<f16>":      setUint16N(6),
  "mat2x3<f16>":      setUint16N(6),
  "mat2x4<f16>":      setUint16N(8),
  "mat4x2<f16>":      setUint16N(8),
  "mat3x3<f16>":      setUint16N(9),
  "mat3x4<f16>":      setUint16N(12),
  "mat4x3<f16>":      setUint16N(12),
  "mat4x4<f16>":      setUint16N(16),
  
  "mat2x2<f32>":      setFloat32N(4),
  "mat3x2<f32>":      setFloat32N(6),
  "mat2x3<f32>":      setFloat32N(6),
  "mat2x4<f32>":      setFloat32N(8),
  "mat4x2<f32>":      setFloat32N(8),
  "mat3x3<f32>":      setFloat32N(9),
  "mat3x4<f32>":      setFloat32N(12),
  "mat4x3<f32>":      setFloat32N(12),
  "mat4x4<f32>":      setFloat32N(16),

  "mat2x2<f64>":      setFloat64N(4),
  "mat3x2<f64>":      setFloat64N(6),
  "mat2x3<f64>":      setFloat64N(6),
  "mat2x4<f64>":      setFloat64N(8),
  "mat4x2<f64>":      setFloat64N(8),
  "mat3x3<f64>":      setFloat64N(9),
  "mat3x4<f64>":      setFloat64N(12),
  "mat4x3<f64>":      setFloat64N(12),
  "mat4x4<f64>":      setFloat64N(16),

  // Virtual types
  "u8": setUint8,
  "i8": setInt8,
  "u16": setUint16,
  "i16": setInt16,
  "vec2<u8>": setUint8N(2),
  "vec2<i8>": setInt8N(2),
  "vec2<u16>": setUint16N(2),
  "vec2<i16>": setInt16N(2),
  "vec3<u8>": setUint8N(3),
  "vec3<i8>": setInt8N(3),
  "vec3<u16>": setUint16N(3),
  "vec3<i16>": setInt16N(3),
  "vec4<u8>": setUint8N(4),
  "vec4<i8>": setInt8N(4),
  "vec4<u16>": setUint16N(4),
  "vec4<i16>": setInt16N(4),

  "vec3to4<u8>": setUint8N(3),
  "vec3to4<i8>": setInt8N(3),
  "vec3to4<u16>": setUint16N(3),
  "vec3to4<i16>": setInt16N(3),
  "vec3to4<u32>": setUint32N(3),
  "vec3to4<i32>": setInt32N(3),
  "vec3to4<f32>": setFloat32N(3),
};
