@infer type T;

@link fn getSample(uv: vec2<f32>) -> @infer(T) T;
@optional @link fn getDepth(uv: vec2<f32>) -> f32 { return 0.0; }

struct WithDepth {
  @builtin(frag_depth) depth: f32,
  @location(0) sample: T,
};

@fragment
fn main(
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) -> WithDepth {
  return WithDepth(
    getDepth(fragUV.xy),
    getSample(fragUV.xy),
  );
}
