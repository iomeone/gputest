@link fn getOffset(i: u32) -> vec2<f32>;

@export fn getScrolledPosition(position: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(position.xy + getOffset(0u), position.zw);
}
