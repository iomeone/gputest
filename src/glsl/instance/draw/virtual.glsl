#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'

SolidVertex getVertex(int, int);

#ifdef IS_PICKING
layout(location = 0) out flat uint fragIndex;
#else
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;
#endif

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  SolidVertex v = getVertex(vertexIndex, instanceIndex);

  gl_Position = v.position;
#ifdef IS_PICKING
  fragIndex = uint(instanceIndex);
#else
  fragColor = v.color;
  fragUV = v.uv;
#endif
}