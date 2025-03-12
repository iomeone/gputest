@export fn displayDepth(depth: f32) -> vec4<f32> {
  var d = select(0.5, -log(depth), depth > 0.0);
  return vec4<f32>(fract(d), fract(d * 16.0) * .75, fract(d * 256.0), 1.0);
}
