#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'
#pragma import {worldToClip3D} from '@use-gpu/glsl/use/view'
#pragma import {getStripIndex} from '@use-gpu/glsl/geometry/strip'
#pragma import {getLineJoin} from '@use-gpu/glsl/geometry/line'

float NaN = 0.0/0.0;

vec4 getPosition(int);
int getSegment(int);
float getSize(int);

#pragma export
SolidVertex getLineVertex(int vertexIndex, int instanceIndex) {
  ivec2 ij = getStripIndex(vertexIndex);

  int segmentLeft = getSegment(instanceIndex);
  if (segmentLeft == 2) {
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
  float size = getSize(cornerIndex);

  vec4 beforePos = getPosition(cornerIndex - 1);
  vec4 centerPos = getPosition(cornerIndex);
  vec4 afterPos = getPosition(cornerIndex + 1);

  vec3 before = worldToClip3D(beforePos);
  vec3 center = worldToClip3D(centerPos);
  vec3 after = worldToClip3D(afterPos);

  float arc = joinIndex / float(LINE_JOIN_SIZE);
  vec3 lineJoin = getLineJoin(before, center, after, arc, xy.y, size, segment, LINE_JOIN_STYLE);

  return SolidVertex(
    vec4(lineJoin, 1.0),
    vec4(0.2, 0.4, 1.0, 1.0),
    uv
  );
}
