#version 450

layout(set = 0, binding = 0) uniform ViewUniforms {
  mat4 projectionMatrix;
  mat4 viewMatrix;
  float blink;
} view;

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 color;
layout(location = 2) in vec2 uv;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

void main() {
  gl_Position = view.projectionMatrix * view.viewMatrix * position;
  fragColor = color;
  fragUV = uv;
}
