@link fn getEmissive(uv: vec2<f32>) -> vec4<f32>;

@export fn getDeferredEmissiveFragment(
  uv: vec2<f32>,
  coord: vec4<f32>,
  index: u32,
) -> vec4<f32> {
  return getEmissive(uv);
}
