// trim
//
// o--o--o  o--o--o--o
// 
// 0  0  0  3  3  3  3
// 2  2  2  6  6  6  6

@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }
@optional @link fn getAnchorStart() -> i32 { return ANCHOR_START; }
@optional @link fn getAnchorEnd() -> i32 { return ANCHOR_END; }

@export fn getLineTrim(index: u32) -> vec4<u32> {
  let s = getAnchorStart();
  let e = getAnchorEnd();

  let n = u32(getLineDetail() + 1);

  let i = index / n;
  let d = index % n;
  
  let start = i * n;
  let end = start + n - 1u;

  var bits = 0u;
  if (s != 0) { bits += 1u; }
  if (e != 0) { bits += 2u; }

  return vec4<u32>(start, end, bits, 0u);
};
