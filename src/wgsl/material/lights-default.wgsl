use '@use-gpu/wgsl/use/types'::{ Light, Radiance };
use '@use-gpu/wgsl/fragment/pbr'::{ PBR };

@infer type T;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  position: vec3<f32>,
  ao: f32,
  @infer(T) params: T,
) -> Radiance {}

@export fn applyLights(
  N: vec3<f32>,
  V: vec3<f32>,
  position: vec3<f32>,
  ao: f32,
  params: T,
) -> vec3<f32> {

  var radiance: vec3<f32> = vec3<f32>(0.0);

  var light = Light(
    vec4<f32>(0.0, 0.0, 0.0, 1.0),
    vec4<f32>(-0.267, -3*0.267, -2*0.267, 0.0),
    vec4<f32>(0.0),
    vec4<f32>(-1.0, 0.0, 0.0, 0.0),
    vec4<f32>(1.0),
    1.0,
    1,
  );

  return applyLight(N, V, light, position, ao, params).light;
}
