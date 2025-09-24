// https://www.shadertoy.com/view/XlKSDR

let PI = 3.141592;
let F_DIELECTRIC = 0.04;

fn saturate(x: f32) -> f32 {
  return max(x, 0.0);
}

fn pow5(x: f32) -> f32 {
  var x2 = x * x;
  return x2 * x2 * x;
}

// D - Normal distribution term
fn ndfGGX2(cosTheta: f32, alpha: f32) -> f32 {
  var alphaSqr = alpha * alpha;
  var denom = cosTheta * cosTheta * (alphaSqr - 1.0) + 1.0f;
  return alphaSqr / (PI * denom * denom);
}

fn ndfGGX(cosTheta: f32, alpha: f32) -> f32 {
  var oneMinus = 1.0 - cosTheta * cosTheta;
  var a = cosTheta * alpha;
  var k = alpha / (oneMinus + a * a);
  var d = k * k * (1.0 / PI);
  return d;
}

// F - Schlick approximation of Fresnel
fn fresnelSchlickVec3(cosTheta: f32, f0: vec3<f32>) -> vec3<f32> {
  var ft = pow5(1.0 - cosTheta);
  return f0 + (1.0 - f0) * ft;
}

fn fresnelSchlick(cosTheta: f32, f0: f32, f90: f32) -> f32 {
  return f0 + (f90 - f0) * pow(1.0 - cosTheta, 5.0);
}

fn fdBurley(dotNL: f32, dotNV: f32, dotLH: f32, alpha: f32) -> f32 {
  var f90 = 0.5 + 2.0 * alpha * dotLH * dotLH;
  var lightScatter = fresnelSchlick(dotNL, 1.0, f90);
  var viewScatter = fresnelSchlick(dotNV, 1.0, f90);
  return lightScatter * viewScatter * (1.0 / PI);
}

// G - Geometric attenuation term
fn smithGGXCorrelated(dotNL: f32, dotNV: f32, alpha: f32) -> f32 {
  var a2 = alpha * alpha;
  var GGXL = dotNV * sqrt((dotNL - a2 * dotNL) * dotNL + a2);
  var GGXV = dotNL * sqrt((dotNV - a2 * dotNV) * dotNV + a2);
  return 0.5 / (GGXL + GGXV);
}

fn G1X(dotNX: f32, k: f32) -> f32 {
  return 1.0f / (dotNX * (1.0f - k) + k);
}

fn geometricGGX(dotNL: f32, dotNV: f32, alpha: f32) -> f32 {
  var k = alpha / 2.0f;
  return G1X(dotNL, k) * G1X(dotNV, k);
}

// N, L, V must be normalized
@export fn PBR(
  N: vec3<f32>,
  L: vec3<f32>,
  V: vec3<f32>,
  albedo: vec3<f32>,
  metalness: f32,
  roughness: f32,
) -> vec3<f32> {

  var diffuseColor = albedo * (1.0 - metalness);
  var F0 = mix(vec3(F_DIELECTRIC), albedo, metalness);

  var alpha = roughness * roughness;
  var dotNV = saturate(dot(N, V));

  var radiance = 3.1415;

  var H = normalize(V + L);
  var dotNL = saturate(dot(N, L));
  var dotNH = saturate(dot(N, H));
  var dotLH = saturate(dot(L, H));

  var F = fresnelSchlickVec3(dotLH, F0);
  var D = ndfGGX(dotNH, alpha);
  var G = smithGGXCorrelated(dotNL, dotNV, alpha);
  //float G2 = geometricGGX(dotNL, dotNV, alpha);
  
  var Fd = albedo * fdBurley(dotNL, dotNV, dotLH, alpha);
  var Fs = F * D * G;

  var direct = (Fd + Fs) * radiance * dotNL;
  return direct;
}
