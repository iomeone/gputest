const A = 0.15;
const B = 0.50;
const C = 0.10;
const D = 0.20;
const E = 0.02;
const F = 0.30;

const W = 11.2;

// Hable 2010, "Filmic Tonemapping Operators"
@export fn tonemapHable(color: vec4<f32>) -> vec4<f32> {
  let x = color * 2.0;
  return hable4(x);
};

fn hable(x: f32) -> f32 {
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
};

fn hable4(x: vec4<f32>) -> vec4<f32> {
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
};
