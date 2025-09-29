use '@use-gpu/wgsl/fragment/sdf-2d'::{ SDF, getUVScale, getBoxSDF, getBorderBoxSDF, getRoundedBorderBoxSDF };
use '@use-gpu/wgsl/use/color'::{ premultiply };

@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); };
@optional @link fn getMask(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> { return color; }

@export fn getScreenFragment(
  fill: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
) -> vec4<f32> {
  var texture = getTexture(uv.xy);

  var color = vec4<f32>(
    premultiply(fill).rgb * (1.0 - texture.a) + texture.rgb,
    mix(fill.a, 1.0, texture.a),
  );

  if (HAS_MASK) {
    color = getMask(color, uv, st);
  }

  return color;
}
