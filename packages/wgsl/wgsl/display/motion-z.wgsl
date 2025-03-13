@export fn displayMotionZ(sample: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(sample.xyz * 65536.0 + 0.5, 1.0);
};

