use '../../../wgsl/use/view'::{ getViewPosition };
use '../../../wgsl/use/types'::{ Light, SurfaceFragment };

@link fn getSurface(uv: vec2<f32>) -> SurfaceFragment;

@link fn applyEnvironment(
  N: vec3<f32>,
  V: vec3<f32>,
  surface: SurfaceFragment,
) -> vec3<f32> { return vec3<f32>(0.0); }

@export fn getDeferredEnvironmentFragment(
  uv: vec2<f32>,
  coord: vec4<f32>,
  index: u32,
) -> vec4<f32> {
  let surface = getSurface(uv.xy, coord);

  let viewPosition = getViewPosition();
  let surfacePosition = surface.position.xyz;
  let toView = viewPosition.xyz - surfacePosition * viewPosition.w;

  let N: vec3<f32> = normalize(surface.normal.xyz);
  let V: vec3<f32> = normalize(toView);

  let output = applyEnvironment(N, V, surface);

  return vec4<f32>(output, 1.0);
}
