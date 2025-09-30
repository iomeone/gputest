use '../../../wgsl/codec/octahedral'::{ encodeOctahedral };
use '../../../wgsl/fragment/bayer'::{ bayer4x4f };

struct GBufferSample {
  @location(0) albedo: vec4<f32>,
  @location(1) normal: vec4<f32>,
  @location(2) material: vec4<f32>,
  @location(3) emissive: vec4<f32>,
};

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
fn main(
  @builtin(front_facing) frontFacing: bool,
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> GBufferSample {

  var normal = fragNormal;
  if (!frontFacing) { normal = -normal; }

  var outColor = fragColor;

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) {
    if (outColor.a <= 0.0) { discard; }
    if (outColor.a < 1.0) {
      let xy = vec2<u32>(fragCoord.xy);
      if (outColor.a < bayer4x4f(xy)) { discard; }
    }
  }

  return GBufferSample(
    vec4<f32>(outColor.rgb, surface.occlusion.a),
    vec4<f32>(encodeOctahedral(surface.normal.xyz), encodeOctahedral(surface.occlusion.xyz)),
    surface.material,
    surface.emissive,
  );
}

struct GBufferSampleWithDepth {
  @builtin(frag_depth) depth: f32,
  @location(0) albedo: vec4<f32>,
  @location(1) normal: vec4<f32>,
  @location(2) material: vec4<f32>,
  @location(3) emissive: vec4<f32>,
};

@fragment
@export fn mainWithDepth(
  @builtin(front_facing) frontFacing: bool,
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> GBufferSampleWithDepth {

  var normal = fragNormal;
  if (!frontFacing) { normal = -normal; }

  var outColor = fragColor;

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) {
    if (outColor.a <= 0.0) { discard; }
    if (outColor.a < 1.0) {
      let xy = vec2<u32>(fragCoord.xy);
      if (outColor.a < bayer4x4f(xy)) { discard; }
    }
  }

  return GBufferSample(
    surface.depth,
    vec4<f32>(outColor.rgb, surface.occlusion.w),
    vec4<f32>(encodeOctahedral(surface.normal.xyz), encodeOctahedral(surface.occlusion.xyz)),
    surface.material,
    surface.emissive,
  );
}
