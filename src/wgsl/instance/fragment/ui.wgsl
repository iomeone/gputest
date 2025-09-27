use '@use-gpu/wgsl/fragment/sdf-2d'::{ SDF, getUVScale };

@external fn getTexture(uv: vec2<f32>) -> vec4<f32> {};
 
@export fn getUIFragment(
  uv: vec2<f32>,
  textureUV: vec2<f32>,
  sdfUV: vec2<f32>,
  sdfConfig: vec4<f32>,
  repeat: i32,
  mode: i32,
  layout: vec4<f32>,
  radius: vec4<f32>,
  border: vec4<f32>,
  stroke: vec4<f32>,
  fill: vec4<f32>,
) -> vec4<f32> {
  
  var sdf: SDF;
  let texture = getTexture(textureUV);

  if (mode == -1) {
    let sdfRadius = sdfConfig.x;
    var expand = border.x;
    
    var scale = getUVScale(sdfUV);
    var d = (texture.a - 0.75) * sdfRadius + 0.5;
    var s = (d + expand) / scale;
    sdf = SDF(s, s);
  }

  var mask = clamp(sdf.outer, 0.0, 1.0);

  if (mask == 0.0) { discard; }

  var color = fill;
  if (sdf.outer != sdf.inner) { color = mix(stroke, fill, clamp(sdf.inner + (1.0 - mask), 0.0, 1.0)); }
  
  if (!HAS_ALPHA_TO_COVERAGE) {
    color = color * fill.a;
    color = color * mask;
  }
  else {
    color = vec4<f32>(color.xyz, color.a * fill.a * mask);
  }
  

  return color;  
}
