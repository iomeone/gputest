#pragma import {getPickingColor} from '@use-gpu/glsl/use/picking';
#pragma import {viewUniforms} from '@use-gpu/glsl/use/view';

vec4 getTexture(vec2);

layout(location = 0) in flat vec4 fragRectangle;
layout(location = 1) in flat vec4 fragRadius;
layout(location = 2) in vec2 fragUV;
layout(location = 3) in flat int fragMode;
#ifdef IS_PICKING
layout(location = 4) in flat uint fragIndex;
#else
layout(location = 4) in flat vec4 fragBorder;
layout(location = 5) in flat vec4 fragStroke;
layout(location = 6) in flat vec4 fragFill;
#endif

layout(location = 0) out vec4 outColor;

struct SDF {
  float outer;
  float inner;
};

float getUVScale(vec2 uv) {
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  return (length(dx) + length(dy)) * 0.5;
}

SDF getBorderBoxSDF(vec4 box, vec4 border, vec2 uv) {
  vec2 wh = box.zw - box.xy;
  float scale = getUVScale(uv * wh);

  vec2 nearest = round(uv);
  vec2 xy = (abs(uv - .5) - .5) * wh;

  float d1 = max(xy.x, xy.y);
  float outer = 0.5 - d1;

  vec2 bs = mix(border.xy, border.zw, nearest);
  float b = max(bs.x, bs.y);

  xy += bs;
  float d2 = max(xy.x, xy.y);
  float inner = 0.5 - d2;

  return SDF(outer / scale, inner / scale);
}

SDF getRoundedBorderBoxSDF(vec4 box, vec4 radius, vec4 border, vec2 uv) {
  vec2 wh = box.zw - box.xy;
  float scale = getUVScale(uv * wh);

  vec2 nearest = round(uv);
  vec2 rs = mix(radius.xw, radius.yz, nearest.x);
  float r = mix(rs.x, rs.y, nearest.y);

  vec2 bs = mix(border.xy, border.zw, nearest);
  float b = max(bs.x, bs.y);

  vec2 xy = (abs(uv - .5) - .5) * wh;

  vec2 clip = max(vec2(0.0), xy + r);
  float neg = min(0.0, max(xy.x, xy.y) + r);

  float outer, inner;
  inner = outer = r + 0.5 - length(clip) - neg;
  if (b > 0.0) {
    xy += bs;
    r = max(0.0, r - b);

    vec2 clip = max(vec2(0.0), xy + r);
    float neg = min(0.0, max(xy.x, xy.y) + r);
    inner = r + 0.5 - length(clip) - neg;
  }

  return SDF(outer / scale, inner / scale);
}

#ifdef IS_PICKING
void main() {
  outColor = getPickingColor(fragIndex);
}
#else
void main() {
  if (fragMode == 0) {
    outColor = fragFill;
    return;
  }
  
  SDF sdf;
  if (fragMode == 1) {
    sdf = getBorderBoxSDF(fragRectangle, fragBorder, fragUV);    
  }
  else {
    sdf = getRoundedBorderBoxSDF(fragRectangle, fragRadius, fragBorder, fragUV);
  }

  float mask = clamp(sdf.outer, 0.0, 1.0);
  vec4 color = mix(fragStroke, fragFill, clamp(sdf.inner + (1.0 - mask), 0.0, 1.0));
  outColor = color;
  outColor *= mask;
}
#endif
