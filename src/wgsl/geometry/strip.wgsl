@export fn getStripIndex(vertex: i32) -> vec2<i32> {
  var x = vertex >> 1u;
  var y = vertex & 1;
  return vec2<i32>(x, y);
}

@export fn getStripUV(vertex: i32) -> vec2<f32> {
  return vec2<f32>(getStripIndex(vertex));
}

