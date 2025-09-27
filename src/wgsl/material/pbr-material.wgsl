use '@use-gpu/wgsl/fragment/pbr'::{ PBRParams };

@optional @link fn getAlbedo(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); }
@optional @link fn getMetalness(uv: vec2<f32>) -> f32 { return 0.2; }
@optional @link fn getRoughness(uv: vec2<f32>) -> f32 { return 0.8; }

@optional @link fn getMetalnessRoughness(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0); }

@export fn getPBRMaterial(
  materialColor: vec3<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> PBRParams {
  var albedo: vec3<f32> = materialColor * getAlbedo(mapUV.xy).rgb;
  
  var metalnessRoughness: vec4<f32> = getMetalnessRoughness(mapUV.xy);
  var roughness: f32 = getRoughness(mapUV.xy) * metalnessRoughness.g;
  var metalness: f32 = getMetalness(mapUV.xy) * metalnessRoughness.b;

  return PBRParams(albedo, metalness, roughness);
}
