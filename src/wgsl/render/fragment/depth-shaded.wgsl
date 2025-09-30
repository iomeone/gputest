use '../../../wgsl/fragment/bayer'::{ bayer4x4f };

@infer type T;

@link fn getSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> @infer(T) T {}

@optional @link fn getScissor(color: vec4<f32>, scissor: vec4<f32>) -> vec4<f32> { return color; }

@fragment
@export fn main(
  @builtin(front_facing) frontFacing: bool,
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> @builtin(frag_depth) f32 {

  var normal = fragNormal;
  if (!frontFacing) { normal = vec4<f32>(-normal.xyz, normal.w); }

  var outColor = fragColor;

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }

  return surface.depth;
}
