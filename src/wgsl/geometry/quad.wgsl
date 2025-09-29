@export fn getQuadIndex(vertex: u32) -> vec2<u32> {
  return vec2<u32>(vertex & 1u, (vertex & 2u) >> 1u);
}

@export fn getQuadUV(vertex: u32) -> vec2<f32> {
  return vec2<f32>(getQuadIndex(vertex));
}

