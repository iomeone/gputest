const COLORS = array(
  vec3<f32>(0.8, 0.2, 0.2),
  vec3<f32>(0.8, 0.6, 0.0),
  vec3<f32>(0.0, 0.7, 0.1),
  vec3<f32>(0.2, 0.4, 1.0),
);

@export fn pmremGridOverlay(xy: vec2<f32>, size1: vec2<f32>, scale: f32) -> vec4<f32> {
  let fxy = floor(xy - .5) + .5;
  let fxys = fxy * 2.0 - size1;
  let axy = abs(fxys);
  let diag = abs(size1.x - axy.x - axy.y);
  let uvd = xy - fxy;
  let outline = min(uvd, 1.0 - uvd);
  let d = min(outline.x, outline.y);
  let sdf = -(d / scale) / size1.x;
  let alpha = clamp(sdf + .5, 0.0, 1.0);

  let s = select(vec2<u32>(0u), vec2<u32>(1u), fxys > vec2<f32>(0.0));
  let rgb = COLORS[s.x + (s.y << 1u)];

  return vec4<f32>(rgb * alpha, alpha);
};

