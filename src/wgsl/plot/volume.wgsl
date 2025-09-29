use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/use/array'::{ sizeToModulus4, packIndex4, unpackIndex4 }

@link fn getSize(i: u32) -> vec4<u32> {};
@optional @link fn getPosition(index: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

@export fn getVolumeGradient(index: u32) -> vec3<f32> {
  let size = getSize();
  let modulus = sizeToModulus4(size);

  let xyzd = unpackIndex4(index, modulus);

  let left   = packIndex4(offsetIndex(xyzd, size, vec3<i32>(-1,  0,  0)), modulus);
  let right  = packIndex4(offsetIndex(xyzd, size, vec3<i32>( 1,  0,  0)), modulus);
  let top    = packIndex4(offsetIndex(xyzd, size, vec3<i32>( 0, -1,  0)), modulus);
  let bottom = packIndex4(offsetIndex(xyzd, size, vec3<i32>( 0,  1,  0)), modulus);
  let front  = packIndex4(offsetIndex(xyzd, size, vec3<i32>( 0,  0, -1)), modulus);
  let back   = packIndex4(offsetIndex(xyzd, size, vec3<i32>( 0,  0,  1)), modulus);

  let dx = getPosition(right) - getPosition(left);
  let dy = getPosition(bottom) - getPosition(top);
  let dz = getPosition(back) - getPosition(front);

  let normal = vec3<f32>(dx, dy, dz);
  return normal;
}

fn offsetIndex(index: vec4<u32>, size: vec4<u32>, offset: vec3<i32>) -> vec4<u32> {
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

  var sz = i32(index.z) + offset.z;
  if (LOOP_Z) {
    if (sz < 0) { sz = sz + i32(size.z); }
    if (sz >= i32(size.z)) { sz = sz - i32(size.z); }
  }
  else {
    if (sz < 0) { sz = 0; }
    if (sz >= i32(size.z)) { sz = i32(size.z) - 1; }
  }
  
  return vec4<u32>(u32(sx), u32(sy), u32(sz), index.w);
}
