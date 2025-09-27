use '@use-gpu/wgsl/use/types'::{ Light, Radiance };
use '@use-gpu/wgsl/fragment/pbr'::{ PBR };

@optional @link fn getLightCount() -> u32 { return 0u; }
@optional @link fn getLight(index: u32) -> Light {
  return Light(
    vec4<f32>(1.0, 1.0, 1.0, 0.0),
    vec4<f32>(-1.0, -1.0, -1.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 0.0),
    vec4<f32>(1.0, 1.0, 1.0, 1.0),
    1,
    1, // Directional
  );
}

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

  let lightCount = getLightCount();
  let n = min(lightCount, 1024u);
  for (var i = 0u; i < lightCount; i++) {
    let light = getLight(i);
    let r = applyLight(N, V, light, position, ao, params);
    radiance += r.light;
  }
  
  return radiance;
}
