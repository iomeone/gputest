@optional @link fn getDepth(uv: vec2<f32>) -> f32 { return 0.0; }

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
) -> @builtin(frag_depth) f32 {
  return getDepth(fragUV);
}
