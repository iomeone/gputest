@export fn getStripIndex(vertex: u32) -> vec2<u32> {
  let x = vertex >> 1u;
  let y = vertex & 1u;
  return vec2<u32>(x, y);
}

@export fn getStripUV(vertex: u32) -> vec2<f32> {
  return vec2<f32>(getStripIndex(vertex));
}

@export fn getStripGridIndex(vertex: u32, detail: u32) -> vec2<u32> {
  let n = 2 * (detail + 3);

  let i = vertex / n;
  let v = u32(clamp(i32(vertex % n) - 1, 0, i32(n - 3)));

  let x = 1 - (v & 1u) + i;
  let y = v >> 1;

  return vec2<u32>(x, y);
}

@export fn getStripTubeUV(vertex: u32, detail: u32) -> vec2<f32> {
  let xy = vec2<f32>(getStripGridIndex(vertex, detail));
  return vec2<f32>(xy.x, xy.y / f32(detail + 1));
}

@export fn getStripGridUV(vertex: u32, detail: u32) -> vec2<f32> {
  let xy = vec2<f32>(getStripGridIndex(vertex, detail));
  return vec2<f32>(xy.x / f32(detail + 1), xy.y / f32(detail + 1));
}
