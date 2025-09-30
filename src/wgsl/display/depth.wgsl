@export fn displayDepth(depth: f32) -> vec4<f32> {
  let hasZ = depth > 0.0;
  if (!hasZ) { return vec4<f32>(0.0, 0.0, 0.1, 1.0); }

  let d = -log(depth);
  return vec4<f32>(fract(d), fract(d * 16.0) * .75, fract(d * 256.0), 1.0);
}
