use '@use-gpu/wgsl/codec/normal16'::{ encodeNormal16 };

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
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> @location(0) vec4<u32> {

  var normal = fragNormal;
  if (!frontFacing) { normal = -normal; }

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);

  var surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }

  return vec4<u32>(encodeNormal16(surface.normal.xyz), 0u, 0u);
}

struct WithDepth {
  @builtin(frag_depth) depth: f32,
  @location(0) normal: vec4<u32>,
};

@fragment
@export fn mainWithDepth(
  @builtin(front_facing) frontFacing: bool,
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> WithDepth {

  var normal = fragNormal;
  if (!frontFacing) { normal = vec4<f32>(-normal.xyz, normal.w); }

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }
  
  return WithDepth(
    surface.depth,
    vec4<u32>(encodeNormal16(surface.normal.xyz), 0u, 0u),
  );
}
