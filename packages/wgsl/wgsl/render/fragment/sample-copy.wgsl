@infer type T;

@link fn getSample(
  uv: vec2<f32>,
) -> @infer(T) T;

@fragment
fn main(
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) -> @location(0) T {
  return getSample(fragUV.xy);
}
