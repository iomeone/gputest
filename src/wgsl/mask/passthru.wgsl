@export fn getPassThruColor(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {
  if (HAS_ALPHA_TO_COVERAGE) {
    return vec4<f32>(color.xyz, color.a);
  }
  else {
    return vec4<f32>(color.xyz * color.a, color.a);
  }
}
