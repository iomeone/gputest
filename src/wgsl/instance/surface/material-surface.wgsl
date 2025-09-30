use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@infer type T;
@link fn getMaterial(
  color: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> @infer(T) T {}

@export fn getMaterialSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> SurfaceFragment {

  let params = getMaterial(color, uv, st);
  let occlusion = vec4<f32>(normal.xyz, params.occlusion);

  return SurfaceFragment(
    position,
    normal,
    occlusion,
    params.albedo,
    params.emissive,
    params.material,
    0.0,
  );
}
