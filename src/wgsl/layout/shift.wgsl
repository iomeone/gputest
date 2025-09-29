@link fn getOffset() -> vec2<f32>;

@export fn getShiftedRectangle(rectangle: vec4<f32>) -> vec4<f32> {
  let offset = getOffset();
  return vec4<f32>(rectangle.xy + offset, rectangle.zw + offset);
}
