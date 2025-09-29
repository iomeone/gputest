use '@use-gpu/wgsl/use/view'::{ getViewPosition };
use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@link fn applyLights(
  N: vec3<f32>,
  V: vec3<f32>,
  surface: SurfaceFragment,
) -> vec3<f32> {}

@export fn getShadedFragment(
  surface: SurfaceFragment,
) -> vec4<f32> {
  let viewPosition = getViewPosition().xyz;
  let surfacePosition = surface.position.xyz;
  let toView: vec3<f32> = viewPosition - surfacePosition;

  let N: vec3<f32> = normalize(surface.normal.xyz);
  let V: vec3<f32> = normalize(toView);

  let light = surface.emissive.xyz + applyLights(N, V, surface);

  //return vec4<f32>(color.xyz, 1.0);
  //return vec4<f32>(mix(color.xyz, N * .5 + .5, .5), 1.0); 
  //return vec4<f32>(N * .5 + .5, 1.0); 

  let alpha = surface.albedo.a;

  if (HAS_ALPHA_TO_COVERAGE) {
    return vec4<f32>(light, alpha);
  }
  else {
    return vec4<f32>(light * alpha, alpha);
  }
}
