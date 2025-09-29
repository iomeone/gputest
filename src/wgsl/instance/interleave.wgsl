@optional @link fn getOffset() -> u32 { return 0u; };
@optional @link fn getSize() -> u32 { return 1u; };

@export fn getIndex(i: u32) -> u32 {
  return i * getSize() + getOffset();
}
