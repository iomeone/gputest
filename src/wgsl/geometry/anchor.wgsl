// anchor
//
// o--o--o-- ... --o
// s s+1           e
//
// o-- ... --o--o--o
// s           e-1 e

@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }
@optional @link fn getAnchorStart() -> i32 { return ANCHOR_START; }
@optional @link fn getAnchorEnd() -> i32 { return ANCHOR_END; }

@export fn getLineAnchor(index: u32) -> vec4<u32> {
  let s = getAnchorStart();
  let e = getAnchorEnd();

  let hasBoth = s != 0 && e != 0;

  var i = index;
  var d = 0u;
  if (hasBoth) {
    i = i >> 1u;
    d = i & 1u;
  }

  let n = u32(getLineDetail() + 1);
  let start = n * i;
  let end = start + n - 1u;

  var both = 0u;
  if (hasBoth) { both = 1u; }

  if (s != 0 && (e == 0 || d == 0u)) {
    return vec4<u32>(start, start + 1u, end, both);
  }
  if (e != 0 && (s == 0 || d == 1u)) {
    return vec4<u32>(end, end - 1u, start, both);
  }

  return vec4<u32>(0u, 0u, 0u, 0u);
};
