float getMask(vec2);
vec4 getTexture(vec2);

#pragma export
vec4 getMaskedFragment(vec4 color, vec2 uv) {
  color *= getMask(uv);
  color *= getTexture(uv);
  return color;
}