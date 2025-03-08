use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@link fn getSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> SurfaceFragment {};

@link fn sampleSSAO(xy: vec2<u32>) -> vec4<f32>;

@export fn getSSAOSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> SurfaceFragment {

  var surface = getSurface(color, uv, st, normal, tangent, position, coord);

  let ssao = sampleSSAO(vec2<u32>(coord.xy));
  surface.occlusion = vec4<f32>(ssao.xyz * 2.0 - 1.0, surface.occlusion.w * ssao.w);

  return surface;
}
