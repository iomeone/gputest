@export fn displayFloat(sample: vec4<f32>) -> vec4<f32> {
  return select(-sample * .333, sample, sample > vec4<f32>(0.0));
};
