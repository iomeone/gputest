@link fn getAxisStep() -> vec4<f32>;
@link fn getAxisOrigin() -> vec4<f32>;

@export fn getAxisPosition(index: u32) -> vec4<f32> {
  return getAxisStep() * f32(index) + getAxisOrigin();
}
