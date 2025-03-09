@infer type T;

@link fn getTexture(uv: vec2<u32>, l: u32) -> @infer(T) T;
@optional @link fn getLevel() -> u32 { return 0u; };

@export fn loadTextureLevel(xy: vec2<u32>) -> T {
  return getTexture(xy, getLevel());
};
