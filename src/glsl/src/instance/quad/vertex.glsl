#import {MeshVertex} from 'use/types';
#import {viewUniforms, worldToClip} from 'use/view';
#import {getQuadUV} from 'geometry/quad';

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  float r = float(instanceIndex);
  vec4 instancePosition = vec4(cos(r), sin(r * 1.341 + r * r), cos(r + cos(r)*1.173), 1.0);

  vec4 position = worldToClip(instancePosition);

  vec2 uv = getQuadUV(vertexIndex);
  vec2 xy = uv * 2.0 - 1.0;
  position.xy += xy * viewUniforms.viewResolution * (50.0 * position.w);

  gl_Position = position;
  fragColor = vec4(abs(instancePosition), 1.0);
  fragUV = uv;
}