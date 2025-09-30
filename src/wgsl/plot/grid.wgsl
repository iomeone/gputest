@link fn getGridValue(i: u32) -> f32;
@link fn getGridDirection() -> i32;
@link fn getGridMin() -> vec4<f32>;
@link fn getGridMax() -> vec4<f32>;
@link fn getGridShift() -> vec4<f32>;

const STEP = vec2<f32>(0.0, 1.0);

@optional @link fn getGridAutoState(base: vec4<f32>, shift: vec4<f32>) -> bool { return true; };

@export fn getGridPosition(index: u32) -> vec4<f32> {
  let n = u32(LINE_DETAIL + 1);

  let k = index / n;
  let i = select(k, k / 2, GRID_AUTO);
  let v = f32(index % n) / f32(n - 1u);

  var base = mix(getGridMin(), getGridMax(), v);

  let dir = getGridDirection();
  var step: vec4<f32>;
  if      (dir == 0) { step = STEP.yxxx; }
  else if (dir == 1) { step = STEP.xyxx; }
  else if (dir == 2) { step = STEP.xxyx; }
  else               { step = STEP.xxxy; }

  if (GRID_AUTO) {
    let shift = getGridShift();
    let a = k % 2;
    if (a == 1) { base += shift; }

    let state = getGridAutoState(
      base,
      select(shift, -shift, a == 1),
    );
    if (!state) {
      return vec4<f32>(0.0);
    }
  }

  return base + step * getGridValue(i);
}
