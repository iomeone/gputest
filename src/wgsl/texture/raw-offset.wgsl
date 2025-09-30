@infer type T;

@link fn getTexture(uv: vec2<u32>) -> @infer(T) T;
@link fn getSize() -> vec2<f32>;
@optional @link fn getOffset() -> vec2<u32> { return vec2<u32>(0); };

@export fn textureUVToXYOffset(uv: vec2<f32>) -> T {
  let xy = vec2<u32>(uv.xy * getSize()) + getOffset();
  return getTexture(xy);
}
