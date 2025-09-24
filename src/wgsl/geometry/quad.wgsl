let QUAD: array<vec2<i32>, 4> = array<vec2<i32>, 4>(
  vec2<i32>(0, 0),
  vec2<i32>(1, 0),
  vec2<i32>(0, 1),
  vec2<i32>(1, 1),
);

@export fn getQuadIndex(vertex: i32) -> vec2<i32> {
  return QUAD[vertex];
}

@export fn getQuadUV(vertex: i32) -> vec2<f32> {
  return vec2<f32>(getQuadIndex(vertex));
}

