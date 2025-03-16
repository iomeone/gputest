@infer type T;

@link fn getTexture(uv: vec2<u32>) -> @infer(T) T;
@link fn getSize() -> vec2<f32>;

@export fn textureUVToXY(uv: vec2<f32>) -> T {
  let xy = vec2<u32>(uv.xy * getSize());
  return getTexture(xy);
}
