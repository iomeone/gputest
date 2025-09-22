#pragma import {viewUniforms} from '@use-gpu/glsl/use/view'

// segments
//
// o--o--o  o--o--o--o  o--o
// 1  3  2  1  3  3  2  1  2

vec2 turn(vec2 xy) {
  return vec2(xy.y, -xy.x);
}

vec2 slerp(float d, vec2 a, vec2 b, float t) {
  float th = acos(d);
  vec2 ab = sin(vec2((1.0 - t) * th, t * th));
  return normalize(a * ab.x + b * ab.y);
}

#pragma export
vec2 lineJoinBevel(vec2 left, vec2 right, int segment, float arc) {
  if (arc > 0) return right;
  return left;
}

#pragma export
vec2 lineJoinMiter(vec2 left, vec2 right, int segment, float arc) {
  vec2 mid;
  float scale = 1.0;

  if (arc == 0.0) return left;
  if (arc == 1.0) return right;

  mid = normalize((left + right) / 2.0);
  scale = min(2.0, 1.0 / max(0.001, dot(mid, left)));

  return mid * scale;
}

#pragma export
vec2 lineJoinRound(vec2 left, vec2 right, int segment, float arc) {
  vec2 mid;

  if (arc == 0.0) return left;
  if (arc == 1.0) return right;

  float d = dot(left, right);
  if (d > 0.999) return left;
  return slerp(d, left, right, arc);
  /*
  if (d < -0.999) {
    mid = normalize(turn(left) + turn(-right));
    if (t < 0.5) return slerp(0.0, left, mid, t*2.0);
    else return slerp(0.0, mid, right, t*2.0 - 1.0);
  }
  */

  //return normalize(mix(left, right, t));
}

#pragma export
vec3 getLineJoin(vec3 beforePoint, vec3 centerPoint, vec3 afterPoint, float arc, float y, float size, int segment, int style) {
  vec2 before = beforePoint.xy * viewUniforms.viewSize;
  vec2 center = centerPoint.xy * viewUniforms.viewSize;
  vec2 after = afterPoint.xy * viewUniforms.viewSize;

  vec2 left = turn(normalize(center - before));
  vec2 right = turn(normalize(after - center));

  vec2 mid;
  if (segment == 2) {
    mid = left;
  }
  else if (segment == 1) {
    mid = right;
  }
  else {
    float c = cross(vec3(left, 0.0), vec3(right, 0.0)).z;
    if (c * y < 0.0) {
      mid = lineJoinMiter(left, right, segment, arc);
    }
    else {
      if (style == 0) mid = lineJoinBevel(left, right, segment, arc);
      if (style == 1) mid = lineJoinMiter(left, right, segment, arc);
      if (style == 2) mid = lineJoinRound(left, right, segment, arc);
    }
  }

  vec2 offset = size * mid * y;
  center.xy += offset;

  return vec3(center * viewUniforms.viewResolution, centerPoint.z);
}
