#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'
#pragma import {viewUniforms, worldToClip} from '@use-gpu/glsl/use/view'
#pragma import {getQuadUV} from '@use-gpu/glsl/geometry/quad'

vec4 getPosition(int);
vec4 getColor(int);
float getSize(int);

#pragma export
SolidVertex getQuadVertex(int vertexIndex, int instanceIndex) {
  vec4 instancePosition = getPosition(instanceIndex);
  vec4 instanceColor = getColor(instanceIndex);
  float instanceSize = getSize(instanceIndex);

  vec4 position = worldToClip(instancePosition);

  vec2 uv = getQuadUV(vertexIndex);
  vec2 xy = uv * 2.0 - 1.0;
  
  #ifdef HAS_EDGE_BLEED
  xy = xy * (instanceSize + 0.5) / instanceSize;
  uv = xy * .5 + .5;
  #endif
  
  position.xy += xy * viewUniforms.viewResolution * (instanceSize * position.w);

  return SolidVertex(
    position,
    instanceColor,
    uv
  );
}