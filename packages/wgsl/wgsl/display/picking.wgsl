@export fn displayPicking(sample: vec4<f32>) -> vec4<f32> {
  let pick = bitcast<vec2<u32>>(sample.xy);

  let a = (pick.x / 16.0) % 1.0;
  let b = (pick.y / 16.0) % 1.0;
  let c = (pick.x + pick.y) / 256.0;

  return sqrt(vec4<f32>(a, c, b, 1.0));
}
