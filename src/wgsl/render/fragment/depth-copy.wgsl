@optional @link fn getDepth(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
) -> vec4<f32> { return vec4<f32>(0.0); }

@fragment
fn main(
  @builtin(front_facing) frontFacing: bool,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,  
) -> @builtin(frag_depth) f32 {

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);
  return getDepth(outColor, fragUV, fragST).r;
}
