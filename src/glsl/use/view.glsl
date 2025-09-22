#pragma export
layout(set = 0, binding = 0) uniform ViewUniforms {
  mat4 projectionMatrix;
  mat4 viewMatrix;
  vec4 viewPosition;
  vec2 viewResolution;
} viewUniforms;

#pragma export
vec4 worldToView(vec4 position) {
  return viewUniforms.viewMatrix * position;
}

#pragma export
vec4 viewToClip(vec4 position) {
  return viewUniforms.projectionMatrix * position;
}

#pragma export
vec4 worldToClip(vec4 position) {
  return viewToClip(worldToView(position));
}