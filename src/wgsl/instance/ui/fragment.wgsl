use './sdf'::{ SDF, getBorderBoxSDF, getRoundedBorderBoxSDF };

@external fn getTexture(uv: vec2<f32>) -> vec4<f32> {};

@stage(fragment)
fn main(
  @location(0) @interpolate(flat) fragRectangle: vec4<f32>,
  @location(1) @interpolate(flat) fragRadius: vec4<f32>,
  @location(2) @interpolate(flat) fragMode: i32,
  @location(3) @interpolate(flat) fragBorder: vec4<f32>,
  @location(4) @interpolate(flat) fragStroke: vec4<f32>,
  @location(5) @interpolate(flat) fragFill: vec4<f32>,
  @location(6) @interpolate(flat) fragRepeat: i32,
  @location(7)                    fragUV: vec2<f32>,
  @location(8)                    fragTextureUV: vec2<f32>,
) -> @location(0) vec4<f32> {
  var fillColor = fragFill;

  var texture = getTexture(fragTextureUV);
  if (texture.a > 0.0) {
    if (fragRepeat == 0 || fragRepeat == 1) {
      if (fragTextureUV.x < 0.0 || fragTextureUV.x > 1.0) { texture.a = 0.0; }
    }
    if (fragRepeat == 0 || fragRepeat == 2) {
      if (fragTextureUV.y < 0.0 || fragTextureUV.y > 1.0) { texture.a = 0.0; }
    }
  
    fillColor = mix(fillColor, texture, texture.a);
  }

  if (fragMode == 0) { return fillColor; }

  var sdf: SDF;
  if (fragMode == 1) { sdf = getBorderBoxSDF(fragRectangle, fragBorder, fragUV); }
  else { sdf = getRoundedBorderBoxSDF(fragRectangle, fragRadius, fragBorder, fragUV); }

  var mask = clamp(sdf.outer, 0.0, 1.0);
  if (mask == 0.0) { discard; }

  var color = mix(fragStroke, fillColor, clamp(sdf.inner + (1.0 - mask), 0.0, 1.0));
  color = color * mask;

  return color;
}
