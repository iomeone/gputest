use '@use-gpu/wgsl/use/types'::{ Light, SurfaceFragment };

@link fn applyMaterial(
  N: vec3<f32>,
  L: vec3<f32>,
  V: vec3<f32>,
  surface: SurfaceFragment,
) -> vec3<f32> {}

@optional @link fn applyDirectionalShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 { return 1.0; }

@optional @link fn applyPointShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 { return 1.0; }

@export fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  surface: SurfaceFragment,
) -> vec3<f32> {
  var L: vec3<f32>;

  var intensity: f32 = light.intensity * 3.1415;
  var radiance: vec3<f32>;

  let kind = light.kind;
  if (kind == 0) {
    // Ambient
    return (surface.occlusion * light.intensity) * surface.albedo.rgb * light.color.rgb;
  }
  else if (kind == 1) {
    // Directional
    L = normalize(-light.normal.xyz);

    if (light.shadowMap >= 0) {
      intensity *= applyDirectionalShadow(light, surface);
    }

    radiance = light.color.rgb * intensity;
  }
  else if (kind == 2) {
    // Dome
    L = normalize(-light.normal.xyz);
    let f = clamp(dot(L, N), 0.0, 1.0);
    let color = mix(light.opts.rgb, light.color.rgb, f);
    let bleed = light.normal.w;
    if (bleed > 0.0) { L = mix(L, N, bleed); };

    radiance = color * intensity;
  }
  else if (kind == 3) {
    // Point
    let d = light.position.xyz - surface.position.xyz;
    L = normalize(d);

    var r = intensity / dot(d, d) - light.cutoff;
    if (r > 0.0) {
      if (light.shadowMap >= 0) {
        r *= applyPointShadow(light, surface);
      }
      radiance = light.color.rgb * r;
    }
    else {
      return vec3<f32>(0.0);
    }
  }
  else {
    return vec3<f32>(0.0);
  }

  let direct = radiance * applyMaterial(N, L, V, surface);
  return direct;
}
