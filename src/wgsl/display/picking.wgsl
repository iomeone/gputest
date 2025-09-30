@export fn displayPicking(sample: vec4<f32>) -> vec4<f32> {
  let pick = vec2<f32>(bitcast<vec2<u32>>(sample.xy));

  let a = (pick.r / 16.0) % 1.0;
  let b = (pick.g / 16.0) % 1.0;
  let c = (pick.r + pick.g) / 256.0;

  return sqrt(vec4<f32>(a, c, b, 1.0));
}
