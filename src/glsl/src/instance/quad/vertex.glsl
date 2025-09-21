#pragma import {MeshVertex} from 'use/types'
#pragma import {viewUniforms, worldToClip} from 'use/view'
#pragma import {getQuadUV} from 'geometry/quad'

vec3 getPosition(int);

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  vec4 instancePosition = vec4(getPosition(instanceIndex), 1.0);
  vec4 position = worldToClip(instancePosition);

  vec2 uv = getQuadUV(vertexIndex);
  vec2 xy = uv * 2.0 - 1.0;
  position.xy += xy * viewUniforms.viewResolution * (50.0 * position.w);

  gl_Position = position;
  fragColor = vec4(abs(instancePosition.xyz), 1.0);
  fragUV = uv;
}