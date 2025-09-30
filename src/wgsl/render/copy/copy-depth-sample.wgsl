@infer type T;

struct DepthSampleOutput {
  @builtin(frag_depth) depth: f32,
  @location(0) sample: T,
};

@link fn getDepth(uv: vec2<f32>) -> f32;
@link fn getSample(uv: vec2<f32>) -> @infer(T) T;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> DepthSampleOutput {
  return DepthSampleOutput(
    getDepth(fragUV),
    getSample(fragUV),
  );
}
