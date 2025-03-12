@infer type T;

@link fn getTexture(ij: vec2<u32>, i: u32, l: u32) -> @infer(T) T;
@optional @link fn getIndex() -> u32 { return 0u; };

@export fn loadTextureIndexLevel(ij: vec2<u32>, l: u32) -> T {
  return getTexture(ij, getIndex(), l);
};
