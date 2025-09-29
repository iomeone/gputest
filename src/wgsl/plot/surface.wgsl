use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3, unpackIndex3 }

@link fn getSize() -> vec3<u32> {};
@optional @link fn getPosition(index: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

// Index an [x,y] x [x+1,y+1] quad on a surface
@export fn getSurfaceIndex(index: u32) -> u32 {
  let vertex = index % 6u;
  let instance = index / 6u;
  let s = getSize();

  var dx = 1u;
  var dy = 1u;
  if (LOOP_X) { dx = 0u; }
  if (LOOP_Y) { dy = 0u; }

  // Modulus for grid of quads (n - 1 unless looped)
  let size = s - vec3<u32>(dx, dy, 0u);
  let modulus = sizeToModulus3(size.xyz);

  var xy = getStripIndex(vertex - (vertex / 3u) * 2u);
  if (vertex < 3u) { xy = xy.yx; }

  let xyd = offsetIndex(unpackIndex3(instance, modulus), s, vec2<i32>(xy));

  // Modulus for grid of vertices (n)
  return packIndex3(xyd, sizeToModulus3(s.xyz));
}

@export fn getSurfaceUV(index: u32) -> vec4<f32> {
  let size = getSize();
  let modulus = sizeToModulus3(size);

  let xyd = unpackIndex3(index, modulus);
  return vec4<f32>(vec3<f32>(xyd) / vec3<f32>(size - 1), 0.0);
}

@export fn getSurfaceNormal(index: u32) -> vec4<f32> {
  let size = getSize();
  let modulus = sizeToModulus3(size);

  let xyd = unpackIndex3(index, modulus);
  
  let left   = packIndex3(offsetIndex(xyd, size, vec2<i32>(-1, 0)), modulus);
  let right  = packIndex3(offsetIndex(xyd, size, vec2<i32>(1, 0)), modulus);
  let top    = packIndex3(offsetIndex(xyd, size, vec2<i32>(0, -1)), modulus);
  let bottom = packIndex3(offsetIndex(xyd, size, vec2<i32>(0, 1)), modulus);

  let dx = getPosition(right) - getPosition(left);
  let dy = getPosition(bottom) - getPosition(top);

  let normal = vec4<f32>(normalize(cross(dx.xyz, dy.xyz)), 0.0);
  return normal;
}

fn offsetIndex(index: vec3<u32>, size: vec3<u32>, offset: vec2<i32>) -> vec3<u32> {
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
