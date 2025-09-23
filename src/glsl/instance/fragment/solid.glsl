#pragma import {getPickingColor} from '@use-gpu/glsl/use/picking';

#ifdef HAS_MASK
#pragma optional
float getMask(vec2);
#endif

#ifdef HAS_TEXTURE
#pragma optional
vec4 getTexture(vec2);
#endif

#ifdef IS_PICKING
layout(location = 0) in flat uint fragIndex;
layout(location = 0) out uvec4 outColor;
#else
layout(location = 0) in vec4 fragColor;
layout(location = 1) in vec2 fragUV;

layout(location = 0) out vec4 outColor;
#endif

#ifdef IS_PICKING
void main() {
  outColor = getPickingColor(fragIndex);
}
#else
void main() {
  outColor = fragColor;
  outColor.xyz *= outColor.a;

  #ifdef HAS_MASK
  outColor *= getMask(fragUV);
  #endif
  #ifdef HAS_TEXTURE
  outColor *= getTexture(fragUV);
  #endif

  if (outColor.a <= 0.0) discard;
}
#endif
