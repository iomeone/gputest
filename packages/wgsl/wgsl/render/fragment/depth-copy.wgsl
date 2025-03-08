@optional @link fn getDepth(
  uv: vec2<f32>,
) -> f32 { return 0.0; }

@fragment
fn main(
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) -> @builtin(frag_depth) f32 {
  return getDepth(fragUV.xy);
}
