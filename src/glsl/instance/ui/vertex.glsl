#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'
#pragma import {worldToClip} from '@use-gpu/glsl/use/view'
#pragma import {getQuadUV} from '@use-gpu/glsl/geometry/quad'

#pragma import {SolidVertex} from '@use-gpu/glsl/use/types'

layout(location = 0) out flat vec4 fragRectangle;
layout(location = 1) out flat vec4 fragRadius;
layout(location = 2) out vec2 fragUV;
layout(location = 3) out flat int fragMode;
#ifdef IS_PICKING
layout(location = 4) out flat uint fragIndex;
#else
layout(location = 4) out flat vec4 fragBorder;
layout(location = 5) out flat vec4 fragStroke;
layout(location = 6) out flat vec4 fragFill;
#endif

vec4 getRectangle(int);
vec4 getRadius(int);
vec4 getBorder(int);
vec4 getFill(int);
vec4 getStroke(int);
vec4 getUV(int);

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  vec4 rectangle = getRectangle(instanceIndex);
  vec4 radius = getRadius(instanceIndex);
  vec4 border = getBorder(instanceIndex);
  vec4 fill = getFill(instanceIndex);
  vec4 stroke = getStroke(instanceIndex);
  vec4 uv4 = getUV(instanceIndex);

  vec2 uv = getQuadUV(vertexIndex);
  vec4 position = vec4(mix(rectangle.xy, rectangle.zw, uv), 0.5, 1.0);
  vec4 center = worldToClip(position);

  uv = mix(uv4.xy, uv4.zw, uv);

  gl_Position = center;

  fragMode = length(radius + border) == 0.0 ? 0 : length(radius) == 0 ? 1 : 2;
  fragRectangle = rectangle;
  fragRadius = radius;
  fragUV = uv;
#ifdef IS_PICKING
  fragIndex = uint(instanceIndex);
#else
  fragBorder = border;
  fragStroke = stroke;
  fragFill = fill;
#endif
}