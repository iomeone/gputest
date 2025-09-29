use '@use-gpu/wgsl/fragment/pbr'::{ PBRParams };

@optional @link fn getAlbedo() -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); }
@optional @link fn getEmissive() -> vec3<f32> { return vec3<f32>(0.0); }
@optional @link fn getMetalness() -> f32 { return 1.0; }
@optional @link fn getRoughness() -> f32 { return 1.0; }

@optional @link fn getAlbedoMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }
@optional @link fn getEmissiveMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }
@optional @link fn getOcclusionMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }
@optional @link fn getMetalnessRoughnessMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }

@export fn getPBRMaterial(
  color: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> PBRParams {
  var albedo: vec4<f32> = color * getAlbedo();
  var roughness: f32 = getRoughness();
  var metalness: f32 = getMetalness();
  var emissive: vec4<f32> = vec4<f32>(getEmissive(), 0.0);
  var occlusion: f32 = 1.0;

  if (HAS_ALBEDO_MAP) {
    albedo *= getAlbedoMap(mapUV.xy);
  }

  if (HAS_EMISSIVE_MAP) {
    emissive *= getEmissiveMap(mapUV.xy);
  }

  if (HAS_OCCLUSION_MAP) {
    occlusion *= getOcclusionMap(mapUV.xy).x;
  }

  var material = vec4<f32>(metalness, roughness, 1.0, 1.0);
  if (HAS_METALNESS_ROUGHNESS_MAP) {
     material *= getMetalnessRoughnessMap(mapUV.xy).bgra;
  }

  return PBRParams(albedo, emissive, material, occlusion);
}
