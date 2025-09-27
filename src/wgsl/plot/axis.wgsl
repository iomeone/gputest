@external fn getAxisStep(i: u32) -> vec4<f32>;
@external fn getAxisOrigin(i: u32) -> vec4<f32>;

@export fn getAxisPosition(index: u32) -> vec4<f32> {
  return getAxisStep(0u) * f32(index) + getAxisOrigin(0u);
}
