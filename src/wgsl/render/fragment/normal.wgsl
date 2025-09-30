use '../../../wgsl/codec/normal16'::{ encodeNormal16, encodeNormal16Plus };

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
  @location(7) @interpolate(flat) fragFacetId: u32,
) -> @location(0) vec4<u32> {

  var normal = fragNormal;
  if (!frontFacing) { normal = -normal; }

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);

  var surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }
  if (HAS_FACET) {
    return encodeNormal16Plus(surface.normal.xyz, fragFacetId);
  }
  else {
    return encodeNormal16(surface.normal.xyz);
  }
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
  @location(7) @interpolate(flat) fragFacetId: u32,
) -> WithDepth {

  var normal = fragNormal;
  if (!frontFacing) { normal = vec4<f32>(-normal.xyz, normal.w); }

  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition, fragCoord);
  outColor = surface.albedo;

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (HAS_ALPHA_TO_DISCARD) { if (outColor.a <= 0.0) { discard; } }

  if (HAS_FACET) {
    return WithDepth(
      surface.depth,
      encodeNormal16Plus(surface.normal.xyz, fragFacetId),
    );
  }
  else {
    return WithDepth(
      surface.depth,
      encodeNormal16(surface.normal.xyz),
    );
  }
}
