@export fn getPassThruFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(color.xyz * color.a, color.a);
}
