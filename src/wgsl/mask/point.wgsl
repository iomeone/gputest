use '../../wgsl/mask/sdf'::{ getUVScale, scaleSDF };

@link fn getSDF(uv: vec2<f32>) -> f32;
@optional @link fn getOutline() -> f32 { return 0.0; }

@export fn outlineSDF(sdf: f32, scale: f32) -> f32 {
  let outline = getOutline();
  if (outline > 0) { return min(sdf, -sdf + outline * scale); }
  return min(sdf, 0.4 - sdf);
}

@export fn getFilledMask(uv: vec2<f32>) -> f32 {
  let l = getSDF(uv);
  let s = getUVScale(uv);
  let a = scaleSDF(l, s);
  return select(select(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);
}

@export fn getOutlinedMask(uv: vec2<f32>) -> f32 {
  let s = getUVScale(uv);
  let l = outlineSDF(getSDF(uv), s);
  let a = scaleSDF(l, s);
  return select(select(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);
}
