use '@use-gpu/wgsl/fragment/sdf-2d'::{ SDF, getUVScale, getBoxSDF, getBorderBoxSDF, getRoundedBorderBoxSDF };
use '@use-gpu/wgsl/use/color'::{ premultiply };

@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); };
@optional @link fn getMask(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> { return color; }

@export fn getUIFragment(
  uv: vec2<f32>,
  textureUV: vec2<f32>,
  textureST: vec2<f32>,
  clipUV: vec4<f32>,
  sdfUV: vec2<f32>,
  sdfConfig: vec4<f32>,
  repeat: i32,
  mode: i32,
  shape: vec4<f32>,
  radius: vec4<f32>,
  border: vec4<f32>,
  stroke: vec4<f32>,
  fill: vec4<f32>,
) -> vec4<f32> {
  var fillColor = fill;
  var strokeColor = stroke;

  var scale = getUVScale(sdfUV);

  var sdf: SDF;
  var texture = getTexture(textureUV);
  var sdfRaw = 0.0;
  var mark = 0.0;

  if (mode == -1 || mode == -2) {
    // SDF Glyph
    let sdfRadius = sdfConfig.x;
    var expand = border.x;
    var bleed = border.y;
    
    var d = (texture.a - 0.75) * sdfRadius;
    var s = (d + expand / sdfConfig.y) / scale + 0.5 + bleed;
    sdf = SDF(s, s);
    
    if (mode == -2) {
      fillColor = vec4<f32>(texture.rgb, fillColor.a);
    }
  }
  else {
    // Textured box
    if (texture.a > 0.0) {
      if (
        ((repeat == 0 || repeat == 1) && (textureUV.x < 0.0 || textureUV.x > 1.0)) ||
        ((repeat == 0 || repeat == 2) && (textureUV.y < 0.0 || textureUV.y > 1.0))
      ) {
        texture.a = 0.0;
      }

      if (texture.a > 0.0) {
        fillColor = vec4<f32>(
          premultiply(fillColor).rgb * (1.0 - texture.a) + texture.rgb,
          mix(fillColor.a, 1.0, texture.a),
        );
      }
    }
    else {
      fillColor = premultiply(fillColor);
    }
  
    // Get appropriate SDF
    if (mode == 0) {
      if (fillColor.a <= 0.0) { discard; }
      sdf = getBoxSDF(shape.xy, uv, scale);
    }
    else if (mode == 1) { sdf = getBorderBoxSDF(shape.xy, border, uv, scale); }
    else { sdf = getRoundedBorderBoxSDF(shape.xy, border, radius, uv, scale); }

    // Bleed by 0.5px to account for filter radius
    let bleed = 0.5;
    sdf.outer += bleed;
    sdf.inner += bleed;
  }

  // Clipping this late because sooner than this causes issues in edge pixels
  if (uv.x < clipUV.x || uv.y < clipUV.y || uv.x > clipUV.z || uv.y > clipUV.w) { discard; }

  var mask = clamp(sdf.outer, 0.0, 1.0);

  // SDF iso-contours
  if (DEBUG_SDF) {
    var s = 4.0;
    var b = 0.0;
    if (mode == -1 || mode == -2) {
      s = 1.0;
      b = 6.0;
    }

    let o = (sdf.outer - 0.5) * scale / s;
    var m = (max(0.0, o + 0.5 + b) % 1.0) - 0.5;
    if (o < -b) { m = 1.0 + (o + b - 1.0); }
    mark = clamp(1.0 - abs(m / scale) * s, 0.0, 1.0);
    
    if ((border.x != border.y) || (border.z != border.w) || (border.x != border.z)) {
      let o = (sdf.inner - 0.5) * scale / s;
      let m = ((o + 0.5 + b) % 1.0) - 0.5;
      let mark2 = 1.0 * clamp(1.0 - abs(m / scale) * s, 0.0, 1.0);
      
      if (sdf.inner > -0.5) { mark = mark2 + mark * 0.5; }
    }
  }
  if (mask == 0.0 && mark == 0.0) { discard; }

  // Blend stroke/fill
  var color = fillColor;
  if (sdf.outer != sdf.inner) {
    // If less than 1px border, render 1px with opacity instead
    var reduce = 1.0;
    if (sdf.outer - sdf.inner < 1.0) {
      reduce = sdf.outer - sdf.inner;
      sdf.inner = sdf.outer - 1.0;
    }
    color = mix(fillColor, strokeColor, reduce * clamp(1.0 - sdf.inner, 0.0, 1.0));
  }

  if (HAS_MASK) {
    color = getMask(color, vec4<f32>(textureUV, 0.0, 0.0), vec4<f32>(textureST, 0.0, 0.0));
  }

  if (!HAS_ALPHA_TO_COVERAGE) {
    color = vec4<f32>((color.rgb + mark) * color.a * mask, color.a * mask + mark);
  }
  else {
    color = vec4<f32>(color.rgb + mark, color.a * mask);
  }

  if (DEBUG_SDF) {
    return vec4<f32>(mix(color.rgb, vec3<f32>(mark), 0.5), color.a);
  }
  
  return color;
}
