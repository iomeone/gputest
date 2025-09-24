#pragma import {PBR} from '@use-gpu/glsl/fragment/pbr';
#pragma import {getPickingColor} from '@use-gpu/glsl/use/picking';
#pragma import {viewUniforms} from '@use-gpu/glsl/use/view';
#pragma import {lightUniforms} from '@use-gpu/glsl/use/light';

#ifdef IS_PICKING
layout(location = 0) in flat uint fragIndex;
layout(location = 0) out uvec4 outColor;
#else
layout(set = 1, binding = 0) uniform sampler s;
layout(set = 1, binding = 1) uniform texture2D t;

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

  vec4 texColor = texture(sampler2D(t, s), fragUV);
  vec4 inColor = fragColor * texColor;
  if (inColor.a <= 0.0) discard;

  vec3 albedo = inColor.rgb;
  float metalness = 0.2;
  float roughness = 0.8;

  vec3 color = PBR(N, L, V, albedo, metalness, roughness) * lightUniforms.lightColor.xyz;
  outColor = vec4(color, inColor.a);

}
#endif

