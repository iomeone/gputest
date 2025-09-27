@export struct SDF {
  outer: f32,
  inner: f32,
};

@export fn getUVScale(sdfUV: vec2<f32>) -> f32 {
  var dx = dpdx(sdfUV);
  var dy = dpdy(sdfUV);
  return (length(dx) + length(dy)) * 0.5;
}

@export fn getBorderBoxSDF(box: vec2<f32>, uv: vec4<f32>, sdfUV: vec4<f32>, border: vec4<f32>) -> SDF {
  var scale = getUVScale(sdfUV);

  var nearest = round(uv);
  var xy = (abs(uv - .5) - .5) * box;

  var d1 = max(xy.x, xy.y);
  var outer = 0.5 - d1;

  var bs = mix(border.xy, border.zw, nearest);
  var b = max(bs.x, bs.y);

  xy = xy + bs;
  var d2 = max(xy.x, xy.y);
  var inner = 0.5 - d2;

  return SDF(outer / scale, inner / scale);
}

@export fn getRoundedBorderBoxSDF(box: vec2<f32>, uv: vec4<f32>, sdfUV: vec4<f32>, border: vec4<f32>, radius: vec4<f32>) -> SDF {
  var scale = getUVScale(sdfUV);

  var nearest = round(uv);
  var rs = mix(radius.xw, radius.yz, nearest.x);
  var r = mix(rs.x, rs.y, nearest.y);

  var bs = mix(border.xy, border.zw, nearest);
  var b = max(bs.x, bs.y);

  var xy = (abs(uv - .5) - .5) * box;

  var clip = max(vec2<f32>(0.0), xy + r);
  var neg = min(0.0, max(xy.x, xy.y) + r);

  var outer: f32;
  var inner: f32;
  outer = r + 0.5 - length(clip) - neg;
  inner = outer;
  if (b > 0.0) {
    xy = xy + bs;
    r = max(0.0, r - b);

    var clip = max(vec2<f32>(0.0), xy + r);
    var neg = min(0.0, max(xy.x, xy.y) + r);
    inner = r + 0.5 - length(clip) - neg;
  }

  return SDF(outer / scale, inner / scale);
}
