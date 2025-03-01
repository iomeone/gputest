@link fn getAccumulateTexture(uv: vec2<f32>) -> vec4<f32>;
@link fn getFrameCount() -> u32 {};

@export fn compositeShader(uv: vec2<f32>) -> vec4<f32> {
  let sample = getAccumulateTexture(uv);
  let norm = f32(getFrameCount());

  return vec4<f32>(sample.xyz / norm, 1.0);
};

