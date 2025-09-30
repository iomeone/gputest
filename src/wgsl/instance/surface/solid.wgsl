use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@link fn getMaterial(
  color: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> vec4<f32> {}

@export fn getSolidSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
) -> SurfaceFragment {

  let albedo = getMaterial(color, uv, st);

  return SurfaceFragment(
    position,
    normal,
    vec4<f32>(0.0, 0.0, 0.0, albedo.a),
    vec4<f32>(albedo.rgb, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0),
    1.0,
    0.0,
  );
}
