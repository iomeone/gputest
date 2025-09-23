#pragma import {PBR} from '@use-gpu/glsl/fragment/pbr';
#pragma import {getPickingColor} from '@use-gpu/glsl/use/picking';
#pragma import {viewUniforms} from '@use-gpu/glsl/use/view';
#pragma import {lightUniforms} from '@use-gpu/glsl/use/light';

#ifdef IS_PICKING
layout(location = 0) in flat uint fragIndex;
layout(location = 0) out uvec4 outColor;
#else
layout(location = 0) in vec4 fragColor;
layout(location = 1) in vec2 fragUV;

layout(location = 2) in vec3 fragNormal;
layout(location = 3) in vec3 fragPosition;

layout(location = 0) out vec4 outColor;
#endif

#ifdef IS_PICKING
void main() {
  outColor = getPickingColor(fragIndex);
}
#else
void main() {
  vec3 fragLight = lightUniforms.lightPosition.xyz - fragPosition;
  vec3 fragView = viewUniforms.viewPosition.xyz - fragPosition;

  vec3 N = normalize(fragNormal);
  vec3 L = normalize(fragLight);
  vec3 V = normalize(fragView);

  vec3 albedo = fragColor.rgb;
  float metalness = 0.2;
  float roughness = 0.8;

  vec3 color = PBR(N, L, V, albedo, metalness, roughness) * lightUniforms.lightColor.xyz;
  outColor = vec4(color, fragColor.a);
}
#endif

