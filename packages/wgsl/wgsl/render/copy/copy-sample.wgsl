@infer type T;

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> @location(0) T {
  return getSample(fragUV);
}
