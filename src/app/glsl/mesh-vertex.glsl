#version 450

layout(set = 0, binding = 0) uniform ViewUniforms {
  mat4 projectionMatrix;
  mat4 viewMatrix;
  vec4 viewPosition;
  vec4 lightPosition;
} view;

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 normal;
layout(location = 2) in vec4 color;
layout(location = 3) in vec2 uv;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

layout(location = 2) out vec3 fragNormal;
layout(location = 3) out vec3 fragLight;
layout(location = 4) out vec3 fragView;

void main() {
  gl_Position = view.projectionMatrix * view.viewMatrix * position;

  fragColor = color;
  fragUV = uv;

  fragNormal = normal.xyz;
  fragLight = view.lightPosition.xyz - position.xyz;
  fragView = view.viewPosition.xyz - position.xyz;
}
