const ivec2 QUAD[] = {
  ivec2(0, 0),
  ivec2(1, 0),
  ivec2(0, 1),
  ivec2(1, 1),
};

export ivec2 getQuadIndex(int vertex) {
  return QUAD[vertex];
  /*
  vertex = min(vertex, 6 - vertex);
  ivec2 iuv = vertex & ivec2(1, 2);
  iuv.y = iuv.y >> 1;

  return iuv;
  */
}

export vec2 getQuadUV(int vertex) {
  return vec2(getQuadIndex(vertex));
}

export MeshVertex getQuad(int vertex) {
  vec2 uv = getQuadUV(vertex);
  vec4 position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
  vec4 color = vec4(1.0, 0.0, 1.0, 1.0);
  return MeshVertex(position, color, uv);
}
