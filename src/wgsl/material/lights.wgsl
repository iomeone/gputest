use '@use-gpu/wgsl/use/types'::{ Light };
use '@use-gpu/wgsl/fragment/pbr'::{ PBR };

@infer type T;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  @infer(T) surface: T,
) -> vec3<f32> {}

@link fn getLightCount() -> u32;
@link fn getLight(index: u32) -> Light;

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
    let r = applyLight(N, V, light, surface);
    radiance += r;
  }

  return radiance;
}
