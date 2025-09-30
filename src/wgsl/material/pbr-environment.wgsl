use '@use-gpu/wgsl/fragment/pbr'::{ IBL, IBLResult, environmentBRDF };
use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@link fn sampleEnvironment(uvw: vec3<f32>, sigma: f32, ddx: vec3<f32>, ddy: vec3<f32>) -> vec4<f32>;
@optional @link fn getGain() -> f32 { return 1.0; };

fn sqr(x: f32) -> f32 { return x * x; }

fn varianceForRoughness(roughness: f32) -> f32 {
  if (roughness < 0.4) { return 1.74 * sqr(sqr(roughness)); }
  if (roughness < 0.8) { return 0.575 * roughness - 0.184; }
  return 0.312 * roughness + 0.027;
};

@export fn applyPBREnvironment(
  N: vec3<f32>,
  V: vec3<f32>,
  surface: SurfaceFragment,
) -> vec3<f32> {
  let albedo = surface.albedo;
  let metalness = surface.material.x;
  let roughness = surface.material.y;

  let sigma = sqrt(varianceForRoughness(roughness));
  let ibl = IBL(N, V, albedo.xyz, metalness, roughness);

  let R = reflect(-V, N);

  let Fd = ibl.diffuse;
  let Fs = ibl.specular;
  let dotNV = ibl.dotNV;

  let dfx = dpdx(R);
  let dfy = dpdy(R);

  let brdf = environmentBRDF(roughness, dotNV);
  let diffuse = Fd * sampleEnvironment(N, -1.0, dfx, dfy).xyz;
  let specular = max(vec3<f32>(0.0), brdf.x + Fs * brdf.y) * sampleEnvironment(R, sigma, dfx, dfy).xyz;

  return (diffuse + specular) * surface.occlusion * getGain();
}
