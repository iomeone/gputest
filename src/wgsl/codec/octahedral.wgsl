fn signNotZero(xy: vec2<f32>) -> vec2<f32> {
  let s = sign(xy);
  return select(s, vec2<f32>(1.0, 1.0), s == vec2<f32>(0.0));
}

/** Assumes that v is a unit vector. The result is an octahedral vector on the [-1, +1] square. */
@export fn encodeOctahedral(v: vec3<f32>) -> vec2<f32> {
  let l1norm = abs(v.x) + abs(v.y) + abs(v.z);
  var result = v.xy / l1norm;
  if (v.z < 0.0) {
    result = (1.0 - abs(result.yx)) * signNotZero(result.xy);
  }
  return result;
}

/** Returns a unit vector. Argument o is an octahedral vector packed via encodeOctahedral,
    on the [-1, +1] square */
@export fn decodeOctahedral(o: vec2<f32>) -> vec3<f32> {
  var v = vec3<f32>(o.x, o.y, 1.0 - abs(o.x) - abs(o.y));
  if (v.z < 0.0) {
    v = vec3<f32>((1.0 - abs(v.yx)) * signNotZero(v.xy), v.z);
  }
  return normalize(v);
}

/** Wrap octahedral 2D coordinate (-3...3) to (-1...1) (i.e. 1 fold only) */
@export fn wrapOctahedral(o: vec2<f32>) -> vec2<f32> {
  var wrap = o;
  wrap = select(wrap, vec2<f32>(2.0 * sign(wrap.x) - wrap.x, -wrap.y), abs(wrap.x) > 1.0);
  wrap = select(wrap, vec2<f32>(-wrap.x, 2.0 * sign(wrap.y) - wrap.y), abs(wrap.y) > 1.0);
  return wrap;
}

/** Assumes that v is a unit vector. The result is a hemi-octahedral vector on the [-1, +1] square. */
@export fn encodeHemiOctahedral(v: vec3<f32>) -> vec2<f32> {
  let l1norm = abs(v.x) + abs(v.y) + abs(v.z);
  let r = v.xy / l1norm;

  let xx = ( r.x + r.y);
  let yy = (-r.x + r.y);

  return vec2<f32>(xx, yy);
}

/** Returns a unit vector in the positive Z space. Argument o is an octahedral vector packed via encodeHemiOctahedral,
    on the [-1, +1] square */
@export fn decodeHemiOctahedral(o: vec2<f32>) -> vec3<f32> {
  let xx = (o.x - o.y) * 0.5;
  let yy = (o.x + o.y) * 0.5;

  var v = vec3<f32>(xx, yy, 1.0 - abs(xx) - abs(yy));
  return normalize(v);
}
