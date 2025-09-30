@infer type T;

@link fn getTexture(ij: vec2<u32>) -> @infer(T) T;
@optional @link fn getOffset() -> vec2<u32> { return vec2<u32>(0); };

@export fn downsampleExact2(ij: vec2<u32>) -> T {
  return getTexture(ij * 2 + getOffset());
}
