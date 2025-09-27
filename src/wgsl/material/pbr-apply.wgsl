use '@use-gpu/wgsl/fragment/pbr'::{ PBR, PBRParams };

@export fn applyPBRMaterial(
  N: vec3<f32>,
  L: vec3<f32>,
  V: vec3<f32>,
  radiance: vec3<f32>,
  params: PBRParams,
) -> vec3<f32> {
  return PBR(N, L, V, radiance, params.albedo, params.metalness, params.roughness);
}
