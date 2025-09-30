@export struct SDF {
  outer: f32,
  inner: f32,
};

// Get SDF scale based on pixel UV coordinates.
//
// d(sdfUV) / d(fragX|fragY) = px / px
@export fn getUVScale(sdfUV: vec2<f32>) -> f32 {
  var dx = dpdx(sdfUV);
  var dy = dpdy(sdfUV);
  return (length(dx) + length(dy)) * 0.5;
}

@export fn getBoxSDF(box: vec2<f32>, uv: vec2<f32>, scale: f32) -> SDF {

  // Get absolute pixels for this box quadrant
  var nearest = round(uv);
  var xy = (abs(uv - .5) - .5) * box;

  // Box SDF (approx)
  var d1 = max(xy.x, xy.y);
  var outer = -d1;
  var o = outer / scale;

  return SDF(o, o);
}

@export fn getBorderBoxSDF(box: vec2<f32>, border: vec4<f32>, uv: vec2<f32>, scale: f32) -> SDF {

  // Get absolute pixels for this box quadrant
  var nearest = round(uv);
  var xy = (abs(uv - .5) - .5) * box;

  // Box outer SDF (approx)
  var d1 = max(xy.x, xy.y);
  var outer = -d1;

  // Box inner SDF (approx)
  var flipUV = vec4<f32>(uv, 1.0 - uv);
  var tl = flipUV.xy * box;
  var tr = flipUV.zy * box;
  var bl = flipUV.xw * box;
  var br = flipUV.zw * box;

  var i4 = vec4<f32>(
    getBoxCorner(tl, vec2<f32>(border.x, border.y)),
    getBoxCorner(tr, vec2<f32>(border.z, border.y)),
    getBoxCorner(bl, vec2<f32>(border.x, border.w)),
    getBoxCorner(br, vec2<f32>(border.z, border.w)),
  );
  var inner = min(min(i4.x, i4.y), min(i4.z, i4.w));

  return SDF(outer / scale, inner / scale);
}

@export fn getRoundedBorderBoxSDF(box: vec2<f32>, border: vec4<f32>, radius: vec4<f32>, uv: vec2<f32>, scale: f32) -> SDF {

  var flipUV = vec4<f32>(uv, 1.0 - uv);
  var tl = flipUV.xy * box;
  var tr = flipUV.zy * box;
  var bl = flipUV.xw * box;
  var br = flipUV.zw * box;

  var o4 = vec4<f32>(
    getCircleCorner(tl, radius.x),
    getCircleCorner(tr, radius.y),
    getCircleCorner(bl, radius.w),
    getCircleCorner(br, radius.z),
  );
  var outer = min(min(o4.x, o4.y), min(o4.z, o4.w));

  tl -= border.xy;
  tr -= border.zy;
  bl -= border.xw;
  br -= border.zw;

  var innerRadius = max(
    vec4<f32>(0.0),
    radius - vec4<f32>(
      max(border.x, border.y),
      max(border.z, border.y),
      max(border.x, border.w),
      max(border.z, border.w),
    )
  );

  var i4 = vec4<f32>(
    getCircleCorner(tl, innerRadius.x),
    getCircleCorner(tr, innerRadius.y),
    getCircleCorner(bl, innerRadius.w),
    getCircleCorner(br, innerRadius.z),
  );
  var inner = min(min(i4.x, i4.y), min(i4.z, i4.w));

  return SDF(outer / scale, inner / scale);
}

fn getBoxCorner(xy: vec2<f32>, offset: vec2<f32>) -> f32 {
  var clip = xy - offset;
  return min(clip.x, clip.y);
}

fn getCircleCorner(xy: vec2<f32>, r: f32) -> f32 {
  var clip = max(vec2<f32>(0.0), r - xy);
  var neg = min(0.0, max(-xy.x, -xy.y) + r);
  return r - length(clip) - neg;
}
