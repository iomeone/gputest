@infer type T;
@infer type T1;
@infer type T2;

struct DepthSampleOutput {
  @builtin(frag_depth) depth: f32,
  @location(0) a: T1,
  @location(1) b: T2,
};

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;

@link fn selectDepth(v: T) -> f32;
@link fn selectA(v: T) -> @infer(T1) T1;
@link fn selectB(v: T) -> @infer(T2) T2;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> DepthSampleOutput {
  let sample = getSample(fragUV);
  return DepthSampleOutput(
    selectDepth(sample),
    selectA(sample),
    selectB(sample),
  );
}
