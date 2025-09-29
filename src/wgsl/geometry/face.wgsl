// segments
//
// .-----.
// |     |
// .--.--.
//
// 1 2 3 0 0
//
// triangles:
// [0 1 2]
// [0 2 3]
// [0 3 4]

// detail 1 = 1 tri
@optional @link fn getFaceDetail() -> i32 { return FACE_DETAIL; }
@export fn getFaceSegment(index: u32) -> i32 {
  let n = u32(getFaceDetail() + 2);
  let i = index % n;
  if (i + 2u >= n) { return 0; }
  return i + 1;
};
