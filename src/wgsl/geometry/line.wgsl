use '../../wgsl/use/view'::{ screenToClip3D, clip3DToScreen };

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
  let before = clip3DToScreen(beforePoint);
  let center = clip3DToScreen(centerPoint);
  let after  = clip3DToScreen(afterPoint);

  let left = turn(normalize(center - before));
  let right = turn(normalize(after - center));

  var mid: vec2<f32>;
  if (segment == 2) {
    mid = left;
  }
  else if (segment == 1) {
    mid = right;
  }
  else {
    if (dot(left, right) < 0.999) {
      if (style == 0) { mid = lineJoinMiter(left, right, 0.5); }
      else {
        let c = cross(vec3(left, 0.0), vec3(right, 0.0)).z;
        if (c * y < 0.0) {
          mid = lineJoinMiter(left, right, arc);
        }
        else {
          if (style == 1) { mid = lineJoinBevel(left, right, arc); }
          if (style == 2) { mid = lineJoinMiter(left, right, arc); }
          if (style == 3) { mid = lineJoinRound(left, right, arc); }
        }
      }
    }
    else {
      mid = left;
    }
  }

  let offset = size * mid * y;
  let lineJoin = center + offset;

  return screenToClip3D(lineJoin, centerPoint.z);
}

@export fn lineJoinBevel(left: vec2<f32>, right: vec2<f32>, arc: f32) -> vec2<f32> {
  return select(left, right, arc > 0.0);
}

@export fn lineJoinMiter(left: vec2<f32>, right: vec2<f32>, arc: f32) -> vec2<f32> {
  if (arc == 0.0) { return left; }
  if (arc == 1.0) { return right; }

  let mid = normalize(left + right);
  let scale = min(2.0, 1.0 / max(0.001, dot(mid, left)));

  return mid * scale;
}

@export fn lineJoinRound(left: vec2<f32>, right: vec2<f32>, arc: f32) -> vec2<f32> {
  if (arc == 0.0) { return left; }
  if (arc == 1.0) { return right; }

  let d = dot(left, right);
  if (d > 0.999) { return left; }

  return slerp(d, left, right, arc);
}

fn turn(xy: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(xy.y, -xy.x);
}

fn slerp(d: f32, a: vec2<f32>, b: vec2<f32>, t: f32) -> vec2<f32> {
  let th = acos(d);
  let ab = sin(vec2((1.0 - t) * th, t * th));
  return normalize(a * ab.x + b * ab.y);
}
