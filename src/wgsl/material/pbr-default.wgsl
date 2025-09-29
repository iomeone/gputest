use '@use-gpu/wgsl/fragment/pbr'::{ PBRParams };

const roughness: f32 = 0.5;
const metalness: f32 = 0.0;

@export fn getDefaultPBRMaterial(
  color: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> PBRParams {
  var albedo = color;
  var emissive = vec4<f32>(0.0);
  var material = vec4<f32>(metalness, roughness, 0.0, 0.0);

  return PBRParams(albedo, emissive, material, 1.0);
}
