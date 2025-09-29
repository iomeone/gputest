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

export const setUint16Nx3 = (n: number) => (view: DataView, offset: number, data: Uint16Array): void => {
  let nn = n / 3;
  for (let i = 0; i < nn; ++i) {
    const j = i * 3;
    setUint16(view, offset + i * 8,     data[j]);
    setUint16(view, offset + i * 8 + 2, data[j + 1]);
    setUint16(view, offset + i * 8 + 4, data[j + 2]);
    setUint16(view, offset + i * 8 + 6, 0);
  }
};

export const setUint32Nx3 = (n: number) => (view: DataView, offset: number, data: Uint32Array): void => {
  let nn = n / 3;
  for (let i = 0; i < nn; ++i) {
    const j = i * 3;
    setUint32(view, offset + i * 16,      data[j]);
    setUint32(view, offset + i * 16 + 4,  data[j + 1]);
    setUint32(view, offset + i * 16 + 8,  data[j + 2]);
    setUint32(view, offset + i * 16 + 12, 0);
  }
};

export const setInt32Nx3 = (n: number) => (view: DataView, offset: number, data: Int32Array): void => {
  let nn = n / 3;
  for (let i = 0; i < nn; ++i) {
    const j = i * 3;
    setInt32(view, offset + i * 16,      data[j]);
    setInt32(view, offset + i * 16 + 4,  data[j + 1]);
    setInt32(view, offset + i * 16 + 8,  data[j + 2]);
    setInt32(view, offset + i * 16 + 12, 0);
  }
};

export const setFloat32Nx3 = (n: number) => (view: DataView, offset: number, data: Float32Array): void => {
  let nn = n / 3;
  for (let i = 0; i < nn; ++i) {
    const j = i * 3;
    setFloat32(view, offset + i * 16,      data[j]);
    setFloat32(view, offset + i * 16 + 4,  data[j + 1]);
    setFloat32(view, offset + i * 16 + 8,  data[j + 2]);
    setFloat32(view, offset + i * 16 + 12, 0);
  }
};

export const setFloat64Nx3 = (n: number) => (view: DataView, offset: number, data: Float64Array): void => {
  let nn = n / 3;
  for (let i = 0; i < nn; ++i) {
    const j = i * 3;
    setFloat64(view, offset + i * 32,      data[j]);
    setFloat64(view, offset + i * 32 + 8,  data[j + 1]);
    setFloat64(view, offset + i * 32 + 16, data[j + 2]);
    setFloat64(view, offset + i * 32 + 24, 0);
  }
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
  "mat2x3<u32>":      setUint32Nx3(6),
  "mat2x4<u32>":      setUint32N(8),
  "mat4x2<u32>":      setUint32N(8),
  "mat3x3<u32>":      setUint32Nx3(9),
  "mat3x4<u32>":      setUint32N(12),
  "mat4x3<u32>":      setUint32Nx3(12),
  "mat4x4<u32>":      setUint32N(16),

  "mat2x2<i32>":      setInt32N(4),
  "mat3x2<i32>":      setInt32N(6),
  "mat2x3<i32>":      setInt32Nx3(6),
  "mat2x4<i32>":      setInt32N(8),
  "mat4x2<i32>":      setInt32N(8),
  "mat3x3<i32>":      setInt32Nx3(9),
  "mat3x4<i32>":      setInt32N(12),
  "mat4x3<i32>":      setInt32Nx3(12),
  "mat4x4<i32>":      setInt32N(16),

  "mat2x2<f16>":      setUint16N(4),
  "mat3x2<f16>":      setUint16N(6),
  "mat2x3<f16>":      setUint16Nx3(6),
  "mat2x4<f16>":      setUint16N(8),
  "mat4x2<f16>":      setUint16N(8),
  "mat3x3<f16>":      setUint16Nx3(9),
  "mat3x4<f16>":      setUint16N(12),
  "mat4x3<f16>":      setUint16Nx3(12),
  "mat4x4<f16>":      setUint16N(16),
  
  "mat2x2<f32>":      setFloat32N(4),
  "mat3x2<f32>":      setFloat32N(6),
  "mat2x3<f32>":      setFloat32Nx3(6),
  "mat2x4<f32>":      setFloat32N(8),
  "mat4x2<f32>":      setFloat32N(8),
  "mat3x3<f32>":      setFloat32Nx3(9),
  "mat3x4<f32>":      setFloat32N(12),
  "mat4x3<f32>":      setFloat32Nx3(12),
  "mat4x4<f32>":      setFloat32N(16),

  "mat2x2<f64>":      setFloat64N(4),
  "mat3x2<f64>":      setFloat64N(6),
  "mat2x3<f64>":      setFloat64Nx3(6),
  "mat2x4<f64>":      setFloat64N(8),
  "mat4x2<f64>":      setFloat64N(8),
  "mat3x3<f64>":      setFloat64Nx3(9),
  "mat3x4<f64>":      setFloat64N(12),
  "mat4x3<f64>":      setFloat64Nx3(12),
  "mat4x4<f64>":      setFloat64N(16),

  "atomic<u32>":      setUint32,
  "atomic<i32>":      setInt32,
  "atomic<f32>":      setFloat32,

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
