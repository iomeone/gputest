@infer type T;

@link fn getSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
) -> @infer(T) T {}

@optional @link fn getLight(surface: T) -> vec4<f32> { return surface.albedo; }
@optional @link fn getScissor(color: vec4<f32>, scissor: vec4<f32>) -> vec4<f32> { return color; }

@fragment
fn main(
  @builtin(front_facing) frontFacing: bool,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> @location(0) vec4<f32> {

  var normal = fragNormal;
  if (!frontFacing) { normal = -normal; }

  var outColor = fragColor;

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition);
  outColor = getLight(surface);

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (outColor.a <= 0.0) { discard; }

  return outColor;
}

struct WithDepth {
  @builtin(frag_depth) depth: f32,
  @location(0) color: vec4<f32>,
};

@fragment
@export fn mainWithDepth(
  @builtin(front_facing) frontFacing: bool,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
) -> WithDepth {

  var normal = fragNormal;
  if (!frontFacing) { normal = vec4<f32>(-normal.xyz, normal.w); }

  var outColor = fragColor;

  let surface = getSurface(outColor, fragUV, fragST, normal, fragTangent, fragPosition);
  outColor = getLight(surface);

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (outColor.a <= 0.0) { discard; }

  return WithDepth(surface.depth, outColor);
}
