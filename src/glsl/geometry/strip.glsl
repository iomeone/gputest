#pragma export
ivec2 getStripIndex(int vertex) {
  int x = vertex >> 1;
  int y = vertex & 1;
  return ivec2(x, y);
}

#pragma export
vec2 getStripUV(int vertex) {
  return vec2(getStripIndex(vertex));
}
