@fragment
fn main(
  @location(0) @interpolate(flat) fragId: u32,
  @location(1) @interpolate(flat) fragIndex: u32,
) -> @location(0) vec4<u32> {
  return vec4<u32>(fragId, fragIndex, 0u, 0u);
}

