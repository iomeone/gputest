@export fn displayRGB(sample: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(sample.rgb, 1.0);
};

