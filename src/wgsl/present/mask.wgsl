@optional @link fn getEffect() -> u32 { return 0u; };
@optional @link fn getDirection() -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getValue() -> f32 { return 0.0; };

fn ramp(x: f32, t: f32, s: f32) -> f32 {
  return clamp(x * s + mix(-s, 1.0, t), 0.0, 1.0);
}

@export fn getSlideMask(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {
  let e = getEffect();
  let d = getDirection();
  let v = getValue();

  var m = 1.0;
  // Fade
  if (e == 1u) {
    m = 1.0 - abs(v);
  }
  // Wipe
  else if (e == 2u) {
    let direction = getDirection();
    let l = length(direction);

    let coord = select(st, 1.0 - st, (direction * v) <= vec4<f32>(0.0));
    let line = dot(coord, abs(direction)) / (l + 1.0e-5);

    m = ramp(line, 1.0 - abs(v), 8.0);
  }
  // Move
  else if (e == 3u) {
    m = select(0.0, 1.0, abs(v) < 1.0);
  }
  // Avg visibility
  else {
    m = select(0.0, 1.0, abs(v) < 0.5);
  }

  var c = color;
  if (HAS_ALPHA_TO_COVERAGE) {
    c = vec4<f32>(c.xyz, c.a * m);
  }
  else {
    c = c * m;
  }

  return c;
}
