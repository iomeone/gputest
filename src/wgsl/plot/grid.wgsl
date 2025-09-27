@link fn getGridValue(i: u32) -> f32;
@link fn getGridDirection(i: u32) -> i32;
@link fn getGridMin(i: u32) -> vec4<f32>;
@link fn getGridMax(i: u32) -> vec4<f32>;

let STEP = vec2<f32>(0.0, 1.0);

@export fn getGridPosition(index: u32) -> vec4<f32> {
  let n = u32(LINE_DETAIL + 1);

  let i = index / n;
  let v = f32(index % n) / f32(n - 1u);

  let base = mix(getGridMin(0u), getGridMax(0u), v);

  let dir = getGridDirection(0u);
  var step: vec4<f32>;
  if      (dir == 0) { step = STEP.yxxx; }
  else if (dir == 1) { step = STEP.xyxx; }
  else if (dir == 2) { step = STEP.xxyx; }
  else               { step = STEP.xxxy; }

  return base + step * getGridValue(i);
}
