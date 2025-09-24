use '@use-gpu/wgsl/use/view'::{ viewUniforms };

// segments
//
// o--o--o  o--o--o--o  o--o
// 1  3  2  1  3  3  2  1  2

fn turn(xy: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(xy.y, -xy.x);
}

fn slerp(d: f32, a: vec2<f32>, b: vec2<f32>, t: f32) -> vec2<f32> {
  var th = acos(d);
  var ab = sin(vec2((1.0 - t) * th, t * th));
  return normalize(a * ab.x + b * ab.y);
}

@export fn lineJoinBevel(left: vec2<f32>, right: vec2<f32>, segment: i32, arc: f32) -> vec2<f32> {
  if (arc > 0.0) { return right; }
  return left;
}

@export fn lineJoinMiter(left: vec2<f32>, right: vec2<f32>, segment: i32, arc: f32) -> vec2<f32> {
  var mid: vec2<f32>;
  var scale = 1.0;

  if (arc == 0.0) { return left; }
  if (arc == 1.0) { return right; }

  mid = normalize((left + right) / 2.0);
  scale = min(2.0, 1.0 / max(0.001, dot(mid, left)));

  return mid * scale;
}

@export fn lineJoinRound(left: vec2<f32>, right: vec2<f32>, segment: i32, arc: f32) -> vec2<f32> {
  var mid: vec2<f32>;

  if (arc == 0.0) { return left; }
  if (arc == 1.0) { return right; }

  var d = dot(left, right);
  if (d > 0.999) { return left; }
  return slerp(d, left, right, arc);
}

@export fn getLineJoin(
  beforePoint: vec3<f32>,
  centerPoint: vec3<f32>,
  afterPoint: vec3<f32>,
  arc: f32,
  y: f32,
  size: f32,
  segment: i32,
  style: i32,
) -> vec3<f32> {
  var before = beforePoint.xy * viewUniforms.viewSize;
  var center = centerPoint.xy * viewUniforms.viewSize;
  var after = afterPoint.xy * viewUniforms.viewSize;

  var left = turn(normalize(center - before));
  var right = turn(normalize(after - center));

  var mid: vec2<f32>;
  if (segment == 2) {
    mid = left;
  }
  else if (segment == 1) {
    mid = right;
  }
  else {
    var c = cross(vec3(left, 0.0), vec3(right, 0.0)).z;
    if (c * y < 0.0) {
      mid = lineJoinMiter(left, right, segment, arc);
    }
    else {
      if (style == 0) { mid = lineJoinBevel(left, right, segment, arc); }
      if (style == 1) { mid = lineJoinMiter(left, right, segment, arc); }
      if (style == 2) { mid = lineJoinRound(left, right, segment, arc); }
    }
  }

  var offset = size * mid * y;
  // TODO: awaiting compound support
  //center += offset;
  center = center + offset;

  return vec3<f32>(center * viewUniforms.viewResolution, centerPoint.z);
}
