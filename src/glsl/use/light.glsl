//#pragma export
//struct Light {
//  vec4 position;
//  vec4 color;
//};

#pragma export
layout(set = LIGHT_BINDGROUP, binding = LIGHT_BINDING) uniform LightUniforms {
  vec4 lightPosition;
  vec4 lightColor;
} lightUniforms;
