use '@use-gpu/wgsl/fragment/bayer'::{ bayer4x4f };

@infer type T;

@link fn getFragment(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
) -> @infer(T) T {};

@optional @link fn getScissor(color: vec4<f32>, scissor: vec4<f32>) -> vec4<f32> { return color; }

@fragment
fn main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) {

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);
  outColor = getFragment(outColor, fragUV, fragST);

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }

  if (outColor.a < 1.0) {
    let xy = vec2<u32>(fragCoord.xy);
    if (outColor.a < bayer4x4f(xy)) { discard; }
  }
}
