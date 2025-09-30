@export fn displayAlpha(sample: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(vec3<f32>(sample.a), 1.0);
};

