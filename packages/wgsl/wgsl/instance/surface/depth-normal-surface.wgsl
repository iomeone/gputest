use '@use-gpu/wgsl/use/types'::{ DepthNormalFragment };
use '@use-gpu/wgsl/use/view'::{ worldToDepth, viewToWorld };

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

@link fn getDepthNormal(uv: vec4<f32>) -> DepthNormalFragment;

@export fn getDepthNormalSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> T {

  var surface = getSurface(color, uv, st, normal, tangent, position, coord);
  let fragment = getDepthNormal(uv);

  let offsetPosition = position + vec4<f32>((fragment.depth * normal.w) * normal.xyz, 0.0);
  let depth1 = worldToDepth(position);
  let depth = worldToDepth(offsetPosition);

  surface.normal = viewToWorld(vec4<f32>(fragment.normal.xyz, 0.0));
  surface.depth = depth;
  surface.albedo.a *= fragment.alpha;

  return surface;
}
