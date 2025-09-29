use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@link fn getSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
) -> SurfaceFragment {};

@optional @link fn getNormalMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 0.0); };

@export fn getNormalMapSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
) -> SurfaceFragment {

  let tangentNormal = getNormalMap(uv.xy) * 2.0 - 1.0;

  let bitangent = cross(normal.xyz, tangent.xyz) * tangent.w;
  let bumpNormal = normalize(
    tangentNormal.x * tangent.xyz +
    tangentNormal.y * bitangent +
    tangentNormal.z * normal.xyz
  );

  return getSurface(color, uv, st, vec4<f32>(bumpNormal, 1.0), tangent, position);
}
