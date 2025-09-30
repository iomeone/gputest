fn signNotZero(xy: vec2<f32>) -> vec2<f32> {
  let s = sign(xy);
  return select(s, vec2<f32>(1.0, 1.0), s == vec2<f32>(0.0));
}

/** Assumes that v is a unit vector. The result is an octahedral vector on the [-1, +1] square. */
@export fn encodeOctahedral(v: vec3<f32>) -> vec2<f32> {
  let l1norm = abs(v.x) + abs(v.y) + abs(v.z);
  var result = v.xy * (1.0 / l1norm);
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

/** Wrap octahedral 2D coordinate to (-1...1) */
@export fn wrapOctahedral(o: vec2<f32>) -> vec2<f32> {
  var wrap = o;
  wrap = select(wrap, vec2<f32>(-2.0 - wrap.x, -wrap.y), wrap.x < -1.0);
  wrap = select(wrap, vec2<f32>( 2.0 - wrap.x, -wrap.y), wrap.x >  1.0);
  wrap = select(wrap, vec2<f32>(-wrap.x, -2.0 - wrap.y), wrap.y < -1.0);
  wrap = select(wrap, vec2<f32>(-wrap.x,  2.0 - wrap.y), wrap.y >  1.0);
  return wrap;
}
