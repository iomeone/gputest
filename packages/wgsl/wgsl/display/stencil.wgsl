@export fn displayStencil(sample: vec4<f32>) -> vec4<f32> {
  let stencil = sample.x;

  let a = (stencil) % 1.0;
  let b = (stencil * 4.0) % 1.0;
  let c = (stencil * 16.0) % 1.0;

  return sqrt(vec4<f32>(a, c, b, 1.0));
}
