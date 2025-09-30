@group(PASS) @binding(1) var lightTexture: texture_depth_2d_array;
@group(PASS) @binding(2) var lightSampler: sampler_comparison;

@export fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 {
  return textureSampleCompareLevel(lightTexture, lightSampler, uv, index, level);
}
