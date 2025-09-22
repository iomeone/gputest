#pragma import {worldToClip} from '@use-gpu/glsl/use/view'
#pragma import {pickingUniforms} from '@use-gpu/glsl/use/picking';
#pragma import {lightUniforms} from '@use-gpu/glsl/use/light';

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 normal;
layout(location = 2) in vec4 color;
layout(location = 3) in vec2 uv;

#ifdef IS_PICKING
layout(location = 0) out flat uint fragIndex;
#else
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

layout(location = 2) out vec3 fragNormal;
layout(location = 3) out vec3 fragPosition;
#endif

void main() {
  int instanceIndex = gl_InstanceIndex;
  gl_Position = worldToClip(position);
#ifdef IS_PICKING
  fragIndex = uint(instanceIndex);
#else
  fragColor = color;
  fragUV = uv;

  fragNormal = normal.xyz;
  fragPosition = position.xyz;
#endif
}
