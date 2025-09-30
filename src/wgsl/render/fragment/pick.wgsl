use '@use-gpu/wgsl/mask/scissor':: { isScissored };

@fragment
fn main(
  @location(0) fragScissor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
  @location(2) @interpolate(flat) fragId: u32,
  @location(3) @interpolate(flat) fragIndex: u32,
) -> @location(0) vec4<u32> {
  if (isScissored(fragScissor)) { discard; }

  if (UV_PICKING) {
    let xy = vec2<u32>(clamp(fragUV * 65535.0, vec2<f32>(0.0), vec2<f32>(65535.0)));
    let index = xy.x | (xy.y << 16);
    return vec4<u32>(fragId, index, 0u, 0u);
  }
  else {
    return vec4<u32>(fragId, fragIndex, 0u, 0u);
  }
}

