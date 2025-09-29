@optional @link fn getOutlineStroke() -> f32 { return 0.0; }

fn getUVScale(uv: vec2<f32>) -> f32 {
  let dx = dpdx(uv);
  let dy = dpdy(uv);
  // implicit * 2 / 2
  return (length(dx) + length(dy));
}

fn scaleSDF(sdf: f32, scale: f32) -> f32 {
  let d = sdf / scale + 0.5;
  return clamp(d, 0.0, 1.0) * max(0.0, min(1.0, 2.0 / scale) * 2.0 - 1.0);
}

fn outlineSDF(sdf: f32, scale: f32) -> f32 {
  let stroke = getOutlineStroke();
  if (stroke > 0) { return min(sdf, -sdf + stroke * scale); }
  return min(sdf, 0.4 - sdf);
}

fn circleSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - length(xy);
}

fn diamondSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - (abs(xy.x) + abs(xy.y));
}

fn squareSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - max(abs(xy.x), abs(xy.y));
}

@export fn circle(uv: vec2<f32>) -> f32 {
  let l = circleSDF(uv);
  let s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn diamond(uv: vec2<f32>) -> f32 {
  let l = diamondSDF(uv);
  let s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn square(uv: vec2<f32>) -> f32 {
  let l = squareSDF(uv);
  let s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn circleOutlined(uv: vec2<f32>) -> f32 {
  let s = getUVScale(uv);
  let l = outlineSDF(circleSDF(uv), s);
  return scaleSDF(l, s);
}

@export fn diamondOutlined(uv: vec2<f32>) -> f32 {
  let s = getUVScale(uv);
  let l = outlineSDF(diamondSDF(uv), s);
  return scaleSDF(l, s);
}

@export fn squareOutlined(uv: vec2<f32>) -> f32 {
  let s = getUVScale(uv);
  let l = outlineSDF(squareSDF(uv), s);
  return scaleSDF(l, s);
}
