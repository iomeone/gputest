use '@use-gpu/wgsl/mask/scissor':: { isScissored };

@fragment
fn main(
  @location(0) fragScissor: vec4<f32>,  
  @location(1) @interpolate(flat) fragId: u32,
  @location(2) @interpolate(flat) fragIndex: u32,
) -> @location(0) vec4<u32> {
  if (isScissored(fragScissor)) { discard; }
  return vec4<u32>(fragId, fragIndex, 0u, 0u);
}

