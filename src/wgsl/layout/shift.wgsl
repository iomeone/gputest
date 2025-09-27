@link fn getOffset(i: u32) -> vec2<f32>;

@export fn getShiftedRectangle(rectangle: vec4<f32>) -> vec4<f32> {
  let offset = getOffset(0u);
  return vec4<f32>(rectangle.xy + offset, rectangle.zw + offset);
}
