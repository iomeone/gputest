const float OUTLINE = 0.4;

float getUVScale(vec2 uv) {
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  // implicit factor 2 to account for uv -> xy map
  return length(dx) + length(dy);
}

float scaleSDF(float sdf, float scale) {
  float d = sdf / scale + 0.5;
  return clamp(d, 0.0, 1.0);
}

float outlineSDF(float sdf) {
  return min(sdf, OUTLINE - sdf);
}

float circleSDF(vec2 uv) {
  vec2 xy = uv * 2.0 - 1.0;
  return 1.0 - length(xy);
}

float diamondSDF(vec2 uv) {
  vec2 xy = uv * 2.0 - 1.0;
  return 1.0 - (abs(xy.x) + abs(xy.y));
}

float squareSDF(vec2 uv) {
  vec2 xy = uv * 2.0 - 1.0;
  return 1.0 - max(abs(xy.x), abs(xy.y));
}

#pragma export
float circle(vec2 uv) {
  float l = circleSDF(uv);
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}

#pragma export
float diamond(vec2 uv) {
  float l = diamondSDF(uv);
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}

#pragma export
float square(vec2 uv) {
  float l = squareSDF(uv);
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}

#pragma export
float circleOutlined(vec2 uv) {
  float l = outlineSDF(circleSDF(uv));
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}

#pragma export
float diamondOutlined(vec2 uv) {
  float l = outlineSDF(diamondSDF(uv));
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}

#pragma export
float squareOutlined(vec2 uv) {
  float l = outlineSDF(squareSDF(uv));
  float s = getUVScale(uv);
  return scaleSDF(l, s);
}
