@export fn circleSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - length(xy);
}

@export fn diamondSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - (abs(xy.x) + abs(xy.y));
}

@export fn squareSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  return 1.0 - max(abs(xy.x), abs(xy.y));
}

@export fn triangleSDF(uv: vec2<f32>) -> f32 {
  let xy = uv * 2.0 - 1.0;
  let a = xy.y - 0.5;
  let b = dot(vec2<f32>(abs(xy.x), xy.y), vec2<f32>(0.866, -0.5));
  return 1.0 - min(a, b);
}

@export fn upSDF(uv: vec2<f32>) -> f32 {
  return triangleSDF(uv);
}

@export fn downSDF(uv: vec2<f32>) -> f32 {
  return triangleSDF(vec2<f32>(uv.x, -uv.y));
}

@export fn leftSDF(uv: vec2<f32>) -> f32 {
  return triangleSDF(vec2<f32>(uv.y, uv.x));
}

@export fn rightSDF(uv: vec2<f32>) -> f32 {
  return triangleSDF(vec2<f32>(-uv.y, uv.x));
}

