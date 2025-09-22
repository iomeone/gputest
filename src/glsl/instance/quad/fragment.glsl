#pragma import {viewUniforms} from 'use/view';

layout(location = 0) in vec4 fragColor;
layout(location = 1) in vec2 fragUV;

layout(location = 0) out vec4 outColor;

float getGrid(vec2 uv) {
  vec2 xy = abs(fract(uv) - 0.5);
  return max(xy.x, xy.y) > 0.45 ? 1.0 : 0.5;
}

void main() {
  outColor = vec4(fragColor.xyz * getGrid(fragUV), fragColor.w);
}
