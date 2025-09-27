@link fn getTexture(uv: vec2<f32>, bias: f32) -> vec4<f32> {}

@optional @link fn getLODBias() -> f32 { return 0.0; }

@export fn getLODBiasedTexture(uv: vec2<f32>) -> vec4<f32> {
  return getTexture(uv, getLODBias());
};
