@link fn getSample(uv: vec2<f32>) -> vec4<f32>;

@export fn getSSAOResolve(uv: vec2<f32>) -> vec4<f32> {
  let sample = getSample(uv);

  // Unorm [0..1] encoding for normal
  return vec4<f32>(vec3<f32>(normalize(sample.rgb) * .5 + .5), sample.a);
}
