use '@use-gpu/wgsl/use/types'::{ Light };

@infer type T;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  @infer(T) surface: T,
) -> f32 {}

@export fn applyLights(
  N: vec3<f32>,
  V: vec3<f32>,
  surface: T,
) -> vec3<f32> {

  var radiance: vec3<f32> = vec3<f32>(0.0);

  var light = Light(
    mat4x4<f32>(),
    vec4<f32>(0.0),
    vec4<f32>(-0.267, -3*0.267, -2*0.267, 0.0),
    vec4<f32>(1.0),
    vec4<f32>(0.0),
    0.8,
    0.0,
    1,
    -1,
    0,
    vec2<f32>(0.0),
    vec4<f32>(0.0),
    vec4<f32>(0.0),
  );

  return applyLight(N, V, light, surface);
}
