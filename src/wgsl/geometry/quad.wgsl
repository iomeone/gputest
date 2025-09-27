let QUAD: array<vec2<u32>, 4> = array<vec2<u32>, 4>(
  vec2<u32>(0u, 0u),
  vec2<u32>(1u, 0u),
  vec2<u32>(0u, 1u),
  vec2<u32>(1u, 1u),
);

@export fn getQuadIndex(vertex: u32) -> vec2<u32> {
  return QUAD[vertex];
}

@export fn getQuadUV(vertex: u32) -> vec2<f32> {
  return vec2<f32>(getQuadIndex(vertex));
}

