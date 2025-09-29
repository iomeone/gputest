use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@infer type T = T;
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
) -> SurfaceFragment {

  let params = getMaterial(color, uv, st);

  return SurfaceFragment(
    position,
    normal,
    params.albedo,
    params.emissive,
    params.material,
    params.occlusion,
    0.0,
  );
}
