use '@use-gpu/wgsl/use/types'::{ DepthNormalFragment };

@infer type T;

@link fn getSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> @infer(T) T;

@link fn traceSurface(
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> DepthNormalFragment;

@export fn getRaytraceSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> T {

  var surface = getSurface(color, uv, st, normal, tangent, position, coord);
  let fragment = traceSurface(uv, st, normal, tangent, position, coord);

  surface.normal = fragment.normal;
  surface.depth = fragment.depth;
  surface.albedo.a *= fragment.alpha;

  return surface;
}
