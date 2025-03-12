@link fn getTextureCount() -> f32;

@optional @link fn getTexture1(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture2(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture3(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture4(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture5(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture6(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture7(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture8(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn getMultiViewSample(uv: vec2<f32>) -> vec4<f32> {
  let i = u32(uv.x * getTextureCount());

  if (i == 0) { return getTexture1(uv); }
  if (i == 1) { return getTexture2(uv); }
  if (i == 2) { return getTexture3(uv); }
  if (i == 3) { return getTexture4(uv); }
  if (i == 4) { return getTexture5(uv); }
  if (i == 5) { return getTexture6(uv); }
  if (i == 6) { return getTexture7(uv); }
  if (i == 7) { return getTexture8(uv); }

  return vec4<f32>(0.0);
}
