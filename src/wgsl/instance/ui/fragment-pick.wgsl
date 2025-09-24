use '@use-gpu/glsl/use/picking'::{ getPickingColor };
use './sdf'::{ SDF, getBorderBoxSDF, getRoundedBorderBoxSDF };

@external fn getTexture(uv: vec2<f32>) -> vec4<f32> {};

let NO_BORDER = vec4<f32>(0.0, 0.0, 0.0, 0.0);

@stage(fragment)
fn main(
  @location(0) @interpolate(flat) fragRectangle: vec4<f32>,
  @location(1) @interpolate(flat) fragRadius: vec4<f32>,
  @location(2) @interpolate(flat) fragMode: i32,
  @location(3) @interpolate(flat) fragIndex: u32,
  @location(4)                    fragUV: vec2<f32>,
) -> @location(0) vec4<u32> {
  var color = getPickingColor(fragIndex);
  if (fragMode == 0) { return color; }

  var sdf: SDF;
  if (fragMode == 1) { sdf = getBorderBoxSDF(fragRectangle, NO_BORDER, fragUV); }
  else { sdf = getRoundedBorderBoxSDF(fragRectangle, fragRadius, NO_BORDER, fragUV); }

  var mask = clamp(sdf.outer, 0.0, 1.0);
  if (mask == 0.0) { discard; }

  return color;
}
