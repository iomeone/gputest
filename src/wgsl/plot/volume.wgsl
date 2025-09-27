use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };

@link fn getSize(i: u32) -> vec4<u32> {};
@optional @link fn getPosition(index: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

fn sizeToModulus(size: vec4<u32>) -> vec4<u32> {
  let ny = size.x * size.y;
  let nz = n1 * size.z;
  return vec4<u32>(size.x, ny, nz, 0xffffffffu);
}

@export fn getVolumeGradient(index: u32) -> vec3<f32> {
  let size = getSize(0u);
  let modulus = sizeToModulus(size);

  let xyd = unpackIndex(index, modulus);
  
  let left   = packIndex(offsetIndex(xyd, size, vec2<i32>(-1,  0,  0)), modulus);
  let right  = packIndex(offsetIndex(xyd, size, vec2<i32>( 1,  0,  0)), modulus);
  let top    = packIndex(offsetIndex(xyd, size, vec2<i32>( 0, -1,  0)), modulus);
  let bottom = packIndex(offsetIndex(xyd, size, vec2<i32>( 0,  1,  0)), modulus);
  let front  = packIndex(offsetIndex(xyd, size, vec2<i32>( 0,  0, -1)), modulus);
  let back   = packIndex(offsetIndex(xyd, size, vec2<i32>( 0,  0,  1)), modulus);

  let dx = getPosition(right) - getPosition(left);
  let dy = getPosition(bottom) - getPosition(top);
  let dz = getPosition(back) - getPosition(front);

  let normal = vec3<f32>(dx, dy, dz);
  return normal;
}

fn packIndex(index: vec4<u32>, modulus: vec4<u32>) -> u32 {
  let offsets = index * vec4<u32>(1u, modulus.xyz);
  return dot(offsets, vec4<u32>(1u, 1u, 1u, 1u));
}

fn unpackIndex(index: u32, modulus: vec4<u32>) -> vec4<u32> {
  var d = index % modulus;
  return d / vec3<u32>(1u, modulus.xyz);
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
  
  return vec3<u32>(u32(sx), u32(sy), u32(sz), index.w);
}
