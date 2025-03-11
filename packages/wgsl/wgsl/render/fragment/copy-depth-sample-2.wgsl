@infer type T;

@infer type T1;
@infer type T2;

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;
@link fn selectA(v: T) -> @infer(T1) T1;
@link fn selectB(v: T) -> @infer(T2) T2;

@optional @link fn getDepth(uv: vec2<f32>) -> f32 { return 0.0; }

struct DepthSampleOutput {
  @builtin(frag_depth) depth: f32,
  @location(0) a: T1,
  @location(1) b: T2,
};

@fragment
fn main(
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) -> DepthSampleOutput {
  let sample = getSample(fragUV.xy);
  return DepthSampleOutput(
    getDepth(fragUV.xy),
    selectA(sample),
    selectB(sample),
  );
}
