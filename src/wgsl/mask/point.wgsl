@link fn getSDF(uv: vec2<f32>) -> f32;
@optional @link fn getOutline() -> f32 { return 0.0; }

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
  let outline = getOutline();
  if (outline > 0) { return min(sdf, -sdf + outline * scale); }
  return min(sdf, 0.4 - sdf);
}

@export fn getFilledMask(uv: vec2<f32>) -> f32 {
  let l = getSDF(uv);
  let s = getUVScale(uv);
  return scaleSDF(l, s);
}

@export fn getOutlinedMask(uv: vec2<f32>) -> f32 {
  let s = getUVScale(uv);
  let l = outlineSDF(getSDF(uv), s);
  return scaleSDF(l, s);
}
