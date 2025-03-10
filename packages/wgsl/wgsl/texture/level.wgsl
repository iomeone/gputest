@infer type T;

@link fn getTexture(ij: vec2<u32>, l: u32) -> @infer(T) T;
@optional @link fn getLevel() -> u32 { return 0u; };

@export fn loadTextureLevel(ij: vec2<u32>) -> T {
  return getTexture(ij, getLevel());
};
