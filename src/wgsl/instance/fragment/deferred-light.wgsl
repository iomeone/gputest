use '../../../wgsl/use/view'::{ getViewPosition, clipToWorld, to3D };
use '../../../wgsl/use/types'::{ Light, SurfaceFragment };
use '../../../wgsl/codec/octahedral'::{ decodeOctahedral };

@link fn getSurface(uv: vec2<f32>) -> SurfaceFragment;

@link fn getLight(i: u32) -> Light;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  surface: SurfaceFragment,
) -> vec3<f32>;

@export fn getDeferredLightFragment(
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

  let light = getLight(index);
  let output = applyLight(N, V, light, surface);

  return vec4<f32>(output, 1.0);
}
