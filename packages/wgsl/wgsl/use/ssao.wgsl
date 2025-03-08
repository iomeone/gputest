@group(PASS) @binding(3) var ssaoTexture: texture_2d<f32>;

@export fn sampleSSAO(xy: vec2<u32>) -> vec4<f32> {
  return textureLoad(ssaoTexture, xy, 0u);
}
