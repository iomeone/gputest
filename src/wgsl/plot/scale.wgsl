@external fn getScaleValue(i: u32) -> f32;
@external fn getScaleDirection(i: u32) -> i32;
@external fn getScaleOrigin(i: u32) -> vec4<f32>;

let STEP = vec2<f32>(0.0, 1.0);

@export fn getScalePosition(index: u32) -> vec4<f32> {
  
  let dir = getScaleDirection(0u);

  var step: vec4<f32>;
  if (dir == 0) { step = STEP.yxxx; }
  if (dir == 1) { step = STEP.xyxx; }
  if (dir == 2) { step = STEP.xxyx; }
  if (dir == 3) { step = STEP.xxxy; }
  
  return getScaleOrigin(0u) + step * getScaleValue(index);
}
