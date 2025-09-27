let OUTLINE = 0.4;

fn getUVScale(uv: vec2<f32>) -> f32 {
  var dx = dpdx(uv);
  var dy = dpdy(uv);
  // implicit * 2 / 2
  return (length(dx) + length(dy));
}

fn scaleSDF(sdf: f32, scale: f32) -> f32 {
  var d = sdf / scale + 0.5;
  return clamp(d, 0.0, 1.0) * max(0.0, min(1.0, 2.0 / scale) * 2.0 - 1.0);
}

fn outlineSDF(sdf: f32) -> f32 {
  return min(sdf, OUTLINE - sdf);
}

fn circleSDF(uv: vec2<f32>) -> f32 {
  var xy = uv * 2.0 - 1.0;
  return 1.0 - length(xy);
}

fn diamondSDF(uv: vec2<f32>) -> f32 {
  var xy = uv * 2.0 - 1.0;
  return 1.0 - (abs(xy.x) + abs(xy.y));
}

fn squareSDF(uv: vec2<f32>) -> f32 {
  var xy = uv * 2.0 - 1.0;
  return 1.0 - max(abs(xy.x), abs(xy.y));
}

@export fn circle(uv: vec2<f32>) -> f32 {
  var l = circleSDF(uv);
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn diamond(uv: vec2<f32>) -> f32 {
  var l = diamondSDF(uv);
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn square(uv: vec2<f32>) -> f32 {
  var l = squareSDF(uv);
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn circleOutlined(uv: vec2<f32>) -> f32 {
  var l = outlineSDF(circleSDF(uv));
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn diamondOutlined(uv: vec2<f32>) -> f32 {
  var l = outlineSDF(diamondSDF(uv));
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn squareOutlined(uv: vec2<f32>) -> f32 {
  var l = outlineSDF(squareSDF(uv));
  var s = getUVScale(uv);
  return scaleSDF(l, s);
}
