@optional @external fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };

@export fn getTextureFragment(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {
  return color * getTexture(uv);
}
