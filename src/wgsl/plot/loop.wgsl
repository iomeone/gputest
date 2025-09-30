@export fn loopSurface(index: vec3<u32>, size: vec3<u32>, offset: vec2<i32>) -> vec3<u32> {
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
