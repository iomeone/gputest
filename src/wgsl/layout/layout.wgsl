@link fn getFlip() -> vec2<f32>;
@link fn getOffset() -> vec2<f32>;

@export fn getLayoutPosition(position: vec4<f32>) -> vec4<f32> {
  let flip = getFlip();
  let offset = getOffset();

  var xy = select(position.xy, flip - position.xy, flip > vec2<f32>(0.0));
  return vec4<f32>(xy + offset, position.zw);
}
