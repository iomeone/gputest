use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };

@link fn getSize(i: u32) -> vec4<u32> {};
@optional @link fn getPosition(index: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

fn sizeToModulus(size: vec4<u32>) -> vec3<u32> {
  let n = size.x * size.y;
  return vec3<u32>(size.x, n, 0xffffffffu);
}

// Index an [x,y] x [x+1,y+1] quad on a surface
@export fn getSurfaceIndex(index: u32) -> u32 {
  let vertex = index % 6u;
  let instance = index / 6u;
  let s = getSize(0u);

  var dx = 1u;
  var dy = 1u;
  if (LOOP_X) { dx = 0u; }
  if (LOOP_Y) { dy = 0u; }

  let size = s - vec4<u32>(dx, dy, 0u, 0u);
  let modulus = sizeToModulus(size);

  var xy = getStripIndex(vertex - (vertex / 3u) * 2u);
  if (vertex < 3u) { xy = xy.yx; }

  let xyd = offsetIndex(unpackIndex(instance, modulus), s, vec2<i32>(xy));

  return packIndex(xyd, sizeToModulus(s));
}

@export fn getSurfaceNormal(index: u32) -> vec4<f32> {
  let size = getSize(0u);
  let modulus = sizeToModulus(size);

  let xyd = unpackIndex(index, modulus);
  
  let left   = packIndex(offsetIndex(xyd, size, vec2<i32>(-1, 0)), modulus);
  let right  = packIndex(offsetIndex(xyd, size, vec2<i32>(1, 0)), modulus);
  let top    = packIndex(offsetIndex(xyd, size, vec2<i32>(0, -1)), modulus);
  let bottom = packIndex(offsetIndex(xyd, size, vec2<i32>(0, 1)), modulus);

  let dx = getPosition(right) - getPosition(left);
  let dy = getPosition(bottom) - getPosition(top);

  let normal = vec4<f32>(normalize(cross(dx.xyz, dy.xyz)), 0.0);
  return normal;
}

fn packIndex(index: vec3<u32>, modulus: vec3<u32>) -> u32 {
  let offsets = index * vec3<u32>(1u, modulus.xy);
  return dot(offsets, vec3<u32>(1u, 1u, 1u));
}

fn unpackIndex(index: u32, modulus: vec3<u32>) -> vec3<u32> {
  var d = index % modulus;
  return d / vec3<u32>(1u, modulus.xy);
}

fn offsetIndex(index: vec3<u32>, size: vec4<u32>, offset: vec2<i32>) -> vec3<u32> {
  var sx = i32(index.x) + offset.x;
  if (LOOP_X) {
    if (sx < 0) { sx = sx + i32(size.x); }
    if (sx >= i32(size.x)) { sx = sx - i32(size.x); }
  }
  else {
    if (sx < 0) { sx = 0; }
    if (sx >= i32(size.x)) { sx = i32(size.x) - 1; }
  }

  var sy = i32(index.y) + offset.y;
  if (LOOP_Y) {
    if (sy < 0) { sy = sy + i32(size.y); }
    if (sy >= i32(size.y)) { sy = sy - i32(size.y); }
  }
  else {
    if (sy < 0) { sy = 0; }
    if (sy >= i32(size.y)) { sy = i32(size.y) - 1; }
  }
  
  return vec3<u32>(u32(sx), u32(sy), index.z);
}
