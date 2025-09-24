#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'
#pragma import {viewUniforms, worldToClip, getPerspectiveScale} from '@use-gpu/glsl/use/view'
#pragma import {getQuadUV} from '@use-gpu/glsl/geometry/quad'

vec4 getPosition(int);
vec4 getColor(int);
vec2 getSize(int);
float getDepth(int);

#pragma export
SolidVertex getQuadVertex(int vertexIndex, int instanceIndex) {
  vec4 position = getPosition(instanceIndex);
  vec4 color = getColor(instanceIndex);
  vec2 size = getSize(instanceIndex);
  float depth = getDepth(instanceIndex);

  vec4 center = worldToClip(position);

  vec2 uv = getQuadUV(vertexIndex);
  vec2 xy = uv * 2.0 - 1.0;
  
  // Lerp between fixed size and full perspective.
  float pixelScale = getPerspectiveScale(center.w, depth);
  size *= pixelScale;

  #ifdef HAS_EDGE_BLEED
  xy = xy * (size + 0.5) / size;
  uv = xy * .5 + .5;
  #endif

  center.xy += xy * size * viewUniforms.viewResolution * center.w;

  return SolidVertex(
    center,
    color,
    uv
  );
}