@export fn getStripIndex(vertex: u32) -> vec2<u32> {
  var x = vertex >> 1u;
  var y = vertex & 1u;
  return vec2<u32>(x, y);
}

@export fn getStripUV(vertex: u32) -> vec2<f32> {
  return vec2<f32>(getStripIndex(vertex));
}

