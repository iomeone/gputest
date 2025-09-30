@infer type T;

@link fn getDepth(
  alpha: f32,
  uv: vec4<f32>,
  st: vec4<f32>,
  position: vec4<f32>,
) -> @infer(T) T {};

@optional @link fn getScissor(color: vec4<f32>, scissor: vec4<f32>) -> vec4<f32> { return color; }

@fragment
fn main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragPosition: vec4<f32>,
  @location(4) fragScissor: vec4<f32>,
) -> @builtin(frag_depth) f32 {

  var fragment = getDepth(fragAlpha, fragUV, fragST, fragPosition);
  var outColor = vec4<f32>(0.0, 0.0, 0.0, fragment.alpha);

  if (HAS_SCISSOR) { outColor = getScissor(outColor, fragScissor); }
  if (outColor.a <= 0.0) { discard; }

  if (outColor.a < 1.0) {
    let bits = vec2<u32>(fragCoord.xy) % 2;
    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;
    if (outColor.a < level) { discard; }
  }

  return fragment.depth;
}
