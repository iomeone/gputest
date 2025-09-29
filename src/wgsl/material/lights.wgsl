use '@use-gpu/wgsl/use/types'::{ Light };
use '@use-gpu/wgsl/fragment/pbr'::{ PBR };

@infer type T;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  @infer(T) surface: T,
) -> vec3<f32> {}

@optional @link fn getLightCount() -> u32 { return 0u; }
@optional @link fn getLight(index: u32) -> Light {
  return Light(
    mat4x4<f32>(),
    vec4<f32>(0.0),
    vec4<f32>(-0.267, -3*0.267, -2*0.267, 0.0),
    vec4<f32>(1.0),
    vec4<f32>(0.0),
    2.0,
    0.0,
    1,
    -1,
    0,
    vec2<f32>(0.0),
    vec2<f32>(0.0),
    vec4<f32>(0.0),
  );
}

@export fn applyLights(
  N: vec3<f32>,
  V: vec3<f32>,
  surface: T,
) -> vec3<f32> {

  var radiance: vec3<f32> = vec3<f32>(0.0);

  let lightCount = getLightCount();
  let n = min(lightCount, 1024u);
  for (var i = 0u; i < lightCount; i++) {
    let light = getLight(i);
    var f = vec3<f32>(1.0);

    let r = applyLight(N, V, light, surface);
    radiance += r * f;
  }
  
  return radiance;
}
