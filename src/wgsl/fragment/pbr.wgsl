// https://www.shadertoy.com/view/XlKSDR

const PI = 3.141592;
const F_DIELECTRIC = 0.04;

@export struct PBRParams {
  albedo: vec4<f32>,
  emissive: vec4<f32>,
  material: vec4<f32>,
  occlusion: f32,
};

fn saturate(x: f32) -> f32 {
  return max(x, 0.0);
}

fn pow5(x: f32) -> f32 {
  let x2 = x * x;
  return x2 * x2 * x;
}

// D - Normal distribution term
fn ndfGGX2(cosTheta: f32, alpha: f32) -> f32 {
  let alphaSqr = alpha * alpha;
  let denom = cosTheta * cosTheta * (alphaSqr - 1.0) + 1.0f;
  return alphaSqr / (PI * denom * denom);
}

fn ndfGGX(cosTheta: f32, alpha: f32) -> f32 {
  let oneMinus = 1.0 - cosTheta * cosTheta;
  let a = cosTheta * alpha;
  let k = alpha / (oneMinus + a * a);
  let d = k * k * (1.0 / PI);
  return d;
}

// F - Schlick approximation of Fresnel
fn fresnelSchlick3(cosTheta: f32, f0: vec3<f32>, f90: vec3<f32>) -> vec3<f32> {
  return f0 + (f90 - f0) * pow5(1.0 - cosTheta);
}

fn fresnelSchlick(cosTheta: f32, f0: f32, f90: f32) -> f32 {
  return f0 + (f90 - f0) * pow5(1.0 - cosTheta);
}

fn fdBurley(dotNL: f32, dotNV: f32, dotLH: f32, alpha: f32) -> f32 {
  let f90 = 0.5 + 2.0 * alpha * dotLH * dotLH;
  let lightScatter = fresnelSchlick(dotNL, 1.0, f90);
  let viewScatter = fresnelSchlick(dotNV, 1.0, f90);
  return lightScatter * viewScatter * (1.0 / PI);
}

// G - Geometric attenuation term
fn smithGGXCorrelated(dotNL: f32, dotNV: f32, alpha: f32) -> f32 {
  let a2 = alpha * alpha;
  let GGXL = dotNV * sqrt((dotNL - a2 * dotNL) * dotNL + a2);
  let GGXV = dotNL * sqrt((dotNV - a2 * dotNV) * dotNV + a2);
  return 0.5 / (GGXL + GGXV + 0.00001);
}

fn G1X(dotNX: f32, k: f32) -> f32 {
  return 1.0 / (dotNX * (1.0 - k) + k);
}

fn geometricGGX(dotNL: f32, dotNV: f32, alpha: f32) -> f32 {
  let k = alpha / 2.0f;
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

  let diffuseColor = albedo * (1.0 - metalness);
  let F0 = mix(vec3(F_DIELECTRIC), albedo, metalness);

  let alpha = roughness * roughness;
  let dotNV = saturate(dot(N, V));

  let H = normalize(V + L);
  let dotNL = saturate(dot(N, L));
  let dotNH = saturate(dot(N, H));
  let dotLH = saturate(dot(L, H));

  let F = fresnelSchlick3(dotLH, F0, max(F0, vec3<f32>(1.0 - roughness)));
  let D = ndfGGX(dotNH, alpha);
  let G = smithGGXCorrelated(dotNL, dotNV, alpha);
  //let G = geometricGGX(dotNL, dotNV, alpha);

  let Fd = diffuseColor * fdBurley(dotNL, dotNV, dotLH, alpha) * (1.0 - F);
  let Fs = F * D * G;

  let direct = max(vec3<f32>(0.0), Fd + Fs) * dotNL;
  return direct;
}

@export struct IBLResult {
  diffuse: vec3<f32>,
  specular: vec3<f32>,
  dotNV: f32,
}

// N, V must be normalized
@export fn IBL(
  N: vec3<f32>,
  V: vec3<f32>,
  albedo: vec3<f32>,
  metalness: f32,
  roughness: f32,
) -> IBLResult {

  let diffuseColor = albedo * (1.0 - metalness);
  let F0 = mix(vec3(F_DIELECTRIC), albedo, metalness);

  let alpha = roughness * roughness;
  let dotNV = saturate(dot(N, V));

  let F = fresnelSchlick3(dotNV, F0, max(F0, vec3<f32>(1.0 - roughness)));
  let Fd = diffuseColor / PI * (1.0 - F);
  let Fs = F;

  return IBLResult(Fd, Fs, dotNV);
}

// https://blog.selfshadow.com/publications/s2013-shading-course/lazarov/s2013_pbs_black_ops_2_slides_v2.pdf
@export fn environmentBRDF(g: f32, dotNV: f32) -> vec2<f32> {
  let t = vec4<f32>(1/0.96, 0.475, (0.0275 - 0.25*0.04)/0.96, 0.25) * g + vec4<f32>(0.0, 0.0, (0.015 - 0.75*0.04)/0.96, 0.75);
  let a0 = t.x * min(t.y, exp2(-9.28 * dotNV)) + t.z;
  let a1 = t.w;
  return vec2<f32>(
    a0,
    a1 - a0,
  );
}
