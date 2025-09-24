#pragma export
layout(set = VIEW_BINDGROUP, binding = VIEW_BINDING) uniform ViewUniforms {
  mat4 projectionMatrix;
  mat4 viewMatrix;
  vec4 viewPosition;
  vec2 viewResolution;
  vec2 viewSize;
  float viewWorldUnit;
  float viewPixelRatio;
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

#pragma export
vec3 clipToScreen3D(vec4 position) {
  return vec3(position.xy * viewUniforms.viewSize, position.z);
}

#pragma export
vec3 screenToClip3D(vec4 position) {
  return vec3(position.xy * viewUniforms.viewResolution, position.z);
}

#pragma export
vec3 worldToClip3D(vec4 position) {
  position = viewToClip(worldToView(position));
  return position.xyz / position.w;
}

#pragma export
float getPerspectiveScale(float w, float f) {
  mat4 m = viewUniforms.projectionMatrix;
  float worldScale = m[1][1] * viewUniforms.viewWorldUnit;
  float clipScale = mix(1.0, worldScale / w, f);
  float pixelScale = clipScale * viewUniforms.viewPixelRatio;
  return pixelScale;
}
