@export fn displayMotionZ(sample: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(sample.xyz * 16384.0 + 0.5, 1.0);
};

