#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'
#pragma import {worldToClip, worldToClip3D, getPerspectiveScale} from '@use-gpu/glsl/use/view'
#pragma import {getStripIndex} from '@use-gpu/glsl/geometry/strip'
#pragma import {getLineJoin} from '@use-gpu/glsl/geometry/line'

float NaN = 0.0/0.0;

vec4 getPosition(int);
int getSegment(int);
vec4 getColor(int);
float getSize(int);
float getDepth(int);

#pragma export
SolidVertex getLineVertex(int vertexIndex, int instanceIndex) {
  ivec2 ij = getStripIndex(vertexIndex);

  int segmentLeft = getSegment(instanceIndex);
  if (segmentLeft == 0 || segmentLeft == 2) {
    return SolidVertex(
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec2(NaN, NaN)
    );
  }

  vec2 uv = vec2(ij);
  vec2 xy = uv * 2.0 - 1.0;

  int cornerIndex, joinIndex;
  if (ij.x == 0) {
    joinIndex = LINE_JOIN_SIZE;
    cornerIndex = instanceIndex;
  }
  else {
    joinIndex = ij.x - 1;
    cornerIndex = instanceIndex + 1;
  }

  int segment = getSegment(cornerIndex);
  vec4 color = getColor(cornerIndex);
  float size = getSize(cornerIndex);
  float depth = getDepth(cornerIndex);

  vec4 beforePos = getPosition(cornerIndex - 1);
  vec4 centerPos = getPosition(cornerIndex);
  vec4 afterPos = getPosition(cornerIndex + 1);

  vec3 before = worldToClip3D(beforePos);
  vec4 center = worldToClip(centerPos);
  vec3 after = worldToClip3D(afterPos);

  // Lerp between fixed size and full perspective
  float pixelScale = getPerspectiveScale(center.w, depth);
  size *= pixelScale;

  float arc = joinIndex / float(LINE_JOIN_SIZE);
  vec3 lineJoin = getLineJoin(before, center.xyz / center.w, after, arc, xy.y, size, segment, LINE_JOIN_STYLE);

  return SolidVertex(
    vec4(lineJoin, 1.0),
    color,
    uv
  );
}
