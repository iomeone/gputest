@link fn getGridValue(i: u32) -> f32;
@link fn getGridDirection() -> i32;
@link fn getGridMin() -> vec4<f32>;
@link fn getGridMax() -> vec4<f32>;
@optional @link fn getGridShift() -> vec4<f32> { return vec4<f32>(0.0); };

const STEP = vec2<f32>(0.0, 1.0);

@export fn getGridPosition(index: u32) -> vec4<f32> {
  let n = u32(LINE_DETAIL + 1);

  let i = index / n;
  let v = f32(index % n) / f32(n - 1u);

  let base = mix(getGridMin(), getGridMax(), v) + getGridShift();

  let dir = getGridDirection();
  var step: vec4<f32>;
  if      (dir == 0) { step = STEP.yxxx; }
  else if (dir == 1) { step = STEP.xyxx; }
  else if (dir == 2) { step = STEP.xxyx; }
  else               { step = STEP.xxxy; }

  return base + step * getGridValue(i);
}
