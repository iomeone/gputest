use '@use-gpu/wgsl/use/types'::{ Light, Radiance };

@infer type T;
@link fn applyMaterial(
  N: vec3<f32>,
  L: vec3<f32>,
  V: vec3<f32>,
  radiance: vec3<f32>,
  @infer(T) params: T,
) -> vec3<f32> {}

@export fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  position: vec3<f32>,
  ao: f32,
  params: T,
) -> Radiance {
  var L: vec3<f32>;

  var radiance = light.intensity * light.color.rgb;

  let kind = light.kind;
  if (kind == 0) {
    // Ambient
    return Radiance(vec3<f32>(radiance * ao), true);
  }
  else if (kind == 1) {
    // Directional
    L = normalize(-light.normal.xyz);
    radiance *= 3.1415;
  }
  else if (kind == 2) {
    // Point
    let s = light.size.x;
    let d = light.position.xyz - position;
    L = normalize(d);
    if (s >= 0.0) { radiance *= s*s / dot(d, d); }
    radiance *= 3.1415;
  }
  else {
    return Radiance(vec3<f32>(0.0), false);
  }

  let direct = applyMaterial(N, L, V, radiance, params);
  return Radiance(direct, false);
}
