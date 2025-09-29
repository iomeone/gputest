@link fn getOffset() -> vec2<f32>;

@export fn getScrolledPosition(position: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(position.xy + getOffset(), position.zw);
}
