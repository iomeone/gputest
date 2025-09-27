// segments
//
// o--o--o  o--o--o--o  o--o
// 1  3  2  1  3  3  2  1  2

@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }
@export fn getLineSegment(index: u32) -> i32 {
  let n = u32(getLineDetail() + 1);
  let i = index % n;
  if (i == 0u) { return 1; }
  if (i == n - 1u) { return 2; }
  return 3;
};
