@link fn getTransformMatrix() -> mat4x4<f32>;

@optional @link fn getPolarBend() -> f32 { return 0.0; };
@optional @link fn getPolarFocus() -> f32 { return 0.0; };
@optional @link fn getPolarAspect() -> f32 { return 1.0; };
@optional @link fn getPolarHelix() -> f32 { return 0.0; };

@export fn getPolarPosition(position: vec4<f32>) -> vec4<f32> {
  let polarBend = getPolarBend();
  let polarFocus = getPolarFocus();
  let polarAspect = getPolarAspect();
  let polarHelix = getPolarHelix();

  let matrix = getTransformMatrix();

  if (polarBend > 0.0) {
    if (polarBend < 0.001) {
      // Factor out large addition/subtraction of polarFocus
      // to avoid numerical error
      // sin(x) ~ x
      // cos(x) ~ 1 - x * x / 2
      let pb = position.xy * polarBend;
      let ppbbx = pb.x * pb.x;
      return matrix * vec4(
        position.x * (1.0 - polarBend + (pb.y * polarAspect)),
        position.y * (1.0 - .5 * ppbbx) - (.5 * ppbbx) * polarFocus / polarAspect,
        position.z + position.x * polarHelix * polarBend,
        1.0
      );
    }
    else {
      let xy = position.xy * vec2<f32>(polarBend, polarAspect);
      let radius = polarFocus + xy.y;
      return matrix * vec4<f32>(
        sin(xy.x) * radius,
        (cos(xy.x) * radius - polarFocus) / polarAspect,
        position.z + position.x * polarHelix * polarBend,
        1.0
      );
    }
  }
  return matrix * vec4<f32>(position.xyz, 1.0);
}
