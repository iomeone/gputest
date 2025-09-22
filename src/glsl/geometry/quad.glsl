const ivec2 QUAD[] = {
  ivec2(0, 0),
  ivec2(1, 0),
  ivec2(0, 1),
  ivec2(1, 1),
};

#pragma export
ivec2 getQuadIndex(int vertex) {
  return QUAD[vertex];
}

#pragma export
vec2 getQuadUV(int vertex) {
  return vec2(getQuadIndex(vertex));
}
