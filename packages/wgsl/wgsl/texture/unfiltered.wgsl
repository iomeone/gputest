@infer type T;

@link fn getTexture(uv: vec2<u32>, l: u32) -> @infer(T) T;
@link fn getSize() -> vec2<f32>;
@optional @link fn getBase() -> vec2<f32> { return vec2<f32>(0.0); };
@optional @link fn getLevel() -> u32 { return 0u; };

@export fn getUnfiltered(uv: vec2<f32>) -> T {
  let xy = uv.xy * getSize();
  let xyb = vec2<u32>(xy);
  return getTexture(xyb, getLevel());
}

@export fn getUnfilteredOffset(uv: vec2<f32>) -> T {
  let xy = uv.xy * getSize();
  let xyb = vec2<u32>(xy + getBase());
  return getTexture(xyb, getLevel());
}
