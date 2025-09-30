use '../../wgsl/use/view'::{ getViewVector };

struct PositionNormal {
  position: vec3<f32>,
  normal: vec3<f32>,
};

@export fn getTubeJoin(
  beforePos: vec4<f32>,
  centerPos: vec4<f32>,
  afterPos: vec4<f32>,
  arc: f32,
  y: f32,
  size: f32,
  segment: i32,
  style: i32,
) -> PositionNormal {
  let viewDir = normalize(getViewVector(centerPos.xyz));

  let left = normalize(centerPos.xyz - beforePos.xyz);
  let right = normalize(afterPos.xyz - centerPos.xyz);

  var mid: vec3<f32>;
  if (segment == 2) {
    mid = tubeJoinTangent(viewDir, left, y);
  }
  else if (segment == 1) {
    mid = tubeJoinTangent(viewDir, right, y);
  }
  else {
    if (dot(left, right) < 0.999) {

      if (style == 0) { mid = tubeJoinMiter(viewDir, left, right, 0.5, y); }
      else {
        let c = dot(cross(left, right), viewDir);
        if (c * y > 0.0) {
          mid = tubeJoinMiter(viewDir, left, right, 0.5, y);
        }
        else {
          if (style == 1) { mid = tubeJoinBevel(viewDir, left, right, arc, y); }
          if (style == 2) { mid = tubeJoinMiter(viewDir, left, right, arc, y); }
          if (style == 3) { mid = tubeJoinRound(viewDir, left, right, arc, y); }
        }
      }
    }
    else {
      mid = tubeJoinMiter(viewDir, left, right, 0.5, y);
    }
  }

  let offset = size * mid;
  let tubeJoin = centerPos.xyz + offset;

  return PositionNormal(tubeJoin, offset);
}

@export fn tubeJoinTangent(
  viewDir: vec3<f32>,
  tangent: vec3<f32>,
  y: f32,
) -> vec3<f32> {
  let billboard = normalize(cross(tangent, viewDir) + vec3<f32>(0.0, 0.0, 1e-5));
  let bitangent = cross(tangent, billboard);

  let theta = (y + 1.0) * 1.5707963268;
  let c = cos(theta);
  let s = sin(theta);

  return c * billboard - s * bitangent;
}

@export fn tubeJoinBevel(viewDir: vec3<f32>, left: vec3<f32>, right: vec3<f32>, arc: f32, y: f32) -> vec3<f32> {
  let tangent = select(left, right, arc > 0.0);
  return tubeJoinTangent(viewDir, tangent, y);
}

@export fn tubeJoinMiter(viewDir: vec3<f32>, left: vec3<f32>, right: vec3<f32>, arc: f32, y: f32) -> vec3<f32> {
  var tangent: vec3<f32>;
  var boost = 0.0;

  if (arc == 0.0) { tangent = left; }
  else if (arc == 1.0) { tangent = right; }
  else {
    tangent = normalize(left + right);
    boost = min(2.0, 1.0 / max(0.001, dot(tangent, left))) - 1.0;
  }

  let offset = tubeJoinTangent(viewDir, tangent, y);
  let plane = cross(left, right);

  if (length(plane) > 0.0) {
    let p = normalize(plane);
    let inPlane = offset - p * dot(offset, p);
    return offset + boost * inPlane;
  }

  return offset;
}

@export fn tubeJoinRound(viewDir: vec3<f32>, left: vec3<f32>, right: vec3<f32>, arc: f32, y: f32) -> vec3<f32> {
  var tangent: vec3<f32>;

  if      (arc == 0.0) { tangent = left; }
  else if (arc == 1.0) { tangent = right; }
  else {
    let d = dot(left, right);
    if (d > 0.999) { tangent = left; }
    else           { tangent = slerp(d, left, right, arc); }
  }

  return tubeJoinTangent(viewDir, tangent, y);
}

fn slerp(d: f32, a: vec3<f32>, b: vec3<f32>, t: f32) -> vec3<f32> {
  let th = acos(d);
  let ab = sin(vec2((1.0 - t) * th, t * th));
  return normalize(a * ab.x + b * ab.y);
}
