@infer type T;
@infer type T1;
@infer type T2;

struct SampleOutput {
  @location(0) a: T1,
  @location(1) b: T2,
};

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;

@link fn selectA(v: T) -> @infer(T1) T1;
@link fn selectB(v: T) -> @infer(T1) T2;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> SampleOutput {
  let sample = getSample(fragUV);
  return SampleOutput(
    selectA(sample),
    selectB(sample),
  );
}
