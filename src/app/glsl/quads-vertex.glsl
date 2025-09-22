#version 450

layout(set = 0, binding = 0) uniform ViewUniforms {
  mat4 projectionMatrix;
  mat4 viewMatrix;
  vec4 viewPosition;
  vec2 viewResolution;
} view;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

struct MeshVertex {
  vec4 position;
  vec4 color;
  vec2 uv;
};

const ivec2 QUAD[] = {
  ivec2(0, 0),
  ivec2(1, 0),
  ivec2(0, 1),
  ivec2(1, 1),
};

ivec2 getQuadIndex(int vertex) {
  return QUAD[vertex];
  /*
  vertex = min(vertex, 6 - vertex);
  ivec2 iuv = vertex & ivec2(1, 2);
  iuv.y = iuv.y >> 1;

  return iuv;
  */
}

vec2 getQuadUV(int vertex) {
  return vec2(getQuadIndex(vertex));
}

MeshVertex getQuad(int vertex) {
  vec2 uv = getQuadUV(vertex);
  vec4 position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
  vec4 color = vec4(1.0, 0.0, 1.0, 1.0);
  return MeshVertex(position, color, uv);
}

vec4 worldToView(vec4 position) {
  return view.viewMatrix * position;
}

vec4 viewToClip(vec4 position) {
  return view.projectionMatrix * position;
}

vec4 worldToClip(vec4 position) {
  return viewToClip(worldToView(position));
}

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  float r = float(instanceIndex);
  vec4 instancePosition = vec4(cos(r), sin(r * 1.341 + r * r), cos(r*1.281 + cos(r)*1.173), 1.0);

  vec4 position = worldToClip(instancePosition);

  vec2 uv = getQuadUV(vertexIndex);
  vec2 xy = uv * 2.0 - 1.0;
  position.xy += xy * view.viewResolution * (50.0 * position.w);

  gl_Position = position;
  fragColor = vec4(abs(instancePosition.xyz), 1.0);
  fragUV = uv;
}
