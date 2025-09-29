use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral };

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
  if (outColor.a <= 0.0) { discard; }

  if (outColor.a < 1.0) {
    let bits = vec2<u32>(fragCoord.xy) % 2;
    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;
    if (outColor.a < level) { discard; }
  }

  return GBufferSample(
    vec4<f32>(0.0),
    vec4<f32>(encodeOctahedral(vec3<f32>(0.0, 0.0, -1.0)), 0.0, 0.0),
    vec4<f32>(0.0),
    vec4<f32>(outColor.rgb, 1.0),
  );
}
