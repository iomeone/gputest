@export fn decodeRGBM16(color: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(16.0 * color.rgb * color.a, 1.0);
};