@optional @link fn getNorm() -> f32 { return 1.0; };

@export fn displayInt(sample: vec4<u32>) -> vec4<f32> {
  return vec4<f32>(sample) * getNorm();
};
