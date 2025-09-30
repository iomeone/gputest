use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral };
use '@use-gpu/wgsl/fragment/bayer'::{ bayer4x4f };

struct GBufferSample {
  @location(0) albedo: vec4<f32>,
  @location(1) normal: vec4<f32>,
  @location(2) material: vec4<f32>,
  @location(3) emissive: vec4<f32>,
};

@optional @link fn getFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> { return color; }

@optional @link fn getScissor(color: vec4<f32>, scissor: vec4<f32>) -> vec4<f32> { return color; }

@fragment
fn main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
) -> GBufferSample {

  var outColor = getFragment(fragColor, fragUV, fragST);

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }

  if (outColor.a < 1.0) {
    let xy = vec2<u32>(fragCoord.xy);
    if (outColor.a < bayer4x4f(xy)) { discard; }
  }

  let normal = encodeOctahedral(vec3<f32>(0.0, 0.0, -1.0));

  return GBufferSample(
    vec4<f32>(0.0),
    vec4<f32>(normal, normal),
    vec4<f32>(0.0),
    vec4<f32>(outColor.rgb, 1.0),
  );
}
