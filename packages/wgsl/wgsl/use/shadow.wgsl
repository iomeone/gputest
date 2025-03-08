@group(PASS) @binding(2) var shadowTexture: texture_depth_2d_array;
@group(PASS) @binding(3) var shadowSampler: sampler_comparison;

@export fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 {
  return textureSampleCompareLevel(shadowTexture, shadowSampler, uv, index, level);
}
