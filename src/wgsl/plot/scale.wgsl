@link fn getScaleValue(i: u32) -> f32;
@link fn getScaleDirection() -> i32;
@link fn getScaleOrigin() -> vec4<f32>;

const STEP = vec2<f32>(0.0, 1.0);

@export fn getScalePosition(index: u32) -> vec4<f32> {

  let dir = getScaleDirection();

  var step: vec4<f32>;
  if (dir == 0) { step = STEP.yxxx; }
  if (dir == 1) { step = STEP.xyxx; }
  if (dir == 2) { step = STEP.xxyx; }
  if (dir == 3) { step = STEP.xxxy; }

  return getScaleOrigin() + step * getScaleValue(index);
}
