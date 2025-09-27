use '@use-gpu/wgsl/fragment/pbr'::{ PBRParams };

@export fn getDefaultPBRMaterial(
  materialColor: vec3<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> PBRParams {
  var albedo: vec3<f32> = materialColor;
  var roughness: f32 = 0.5;
  var metalness: f32 = 0.0;

  return PBRParams(albedo, metalness, roughness);
}
