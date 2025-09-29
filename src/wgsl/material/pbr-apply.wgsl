use '@use-gpu/wgsl/fragment/pbr'::{ PBR };
use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@export fn applyPBRMaterial(
  N: vec3<f32>,
  L: vec3<f32>,
  V: vec3<f32>,
  surface: SurfaceFragment,
) -> vec3<f32> {
  return PBR(N, L, V, surface.albedo.xyz, surface.material.x, surface.material.y);
}
