@infer type T;
@infer type TS;

struct DepthSampleOutput {
  @builtin(frag_depth) depth: f32,
  @location(0) sample: T,
};

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;

@link fn selectDepth(v: T) -> f32;
@link fn selectSample(v: T) -> @infer(T1) TS;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> DepthSampleOutput {
  let sample = getSample(fragUV);
  return DepthSampleOutput(
    selectDepth(sample),
    selectSample(sample),
  );
}
