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

@optional @link fn applyHemiShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 { return 1.0; }

@optional @link fn applySpotShadow(
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

  var intensity: f32 = light.intensity * 3.141592;
  var radiance: vec3<f32>;

  let kind = light.kind;
  if (kind == 0) {
    // Ambient
    return (surface.occlusion.w * light.intensity) * surface.albedo.rgb * light.color.rgb;
  }
  else if (kind == 1) {
    // Dome
    L = normalize(-light.normal.xyz);
    let f = clamp(dot(L, N), 0.0, 1.0);
    let color = mix(light.opts.rgb, light.color.rgb, f);
    let bleed = light.normal.w;
    if (bleed > 0.0) { L = mix(L, N, bleed); };

    radiance = color * intensity;
  }
  else if (kind == 2) {
    // Directional
    L = normalize(-light.normal.xyz);

    if (light.shadowMap >= 0) {
      intensity *= applyDirectionalShadow(light, surface);
    }

    radiance = light.color.rgb * intensity;
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
  else if (kind == 4) {
    // Hemispherical
    let d = light.position.xyz - surface.position.xyz;
    L = normalize(d);

    let f = dot(L, -light.normal.xyz);
    var r = intensity / dot(d, d) - light.cutoff;
    if (r > 0.0 && f >= light.opts.x) {
      if (light.shadowMap >= 0) {
        r *= applyHemiShadow(light, surface);
      }
      let feather = min((f - light.opts.x) * light.opts.y, 1.0);
      radiance = light.color.rgb * r * smoothstep(0.0, 1.0, feather);
    }
    else {
      return vec3<f32>(0.0);
    }
  }
  else if (kind == 5) {
    // Spotlight
    let d = light.position.xyz - surface.position.xyz;
    L = normalize(d);

    let f = dot(L, -light.normal.xyz);
    var r = intensity / dot(d, d) - light.cutoff;
    if (r > 0.0 && f >= light.opts.x) {
      if (light.shadowMap >= 0) {
        r *= applySpotShadow(light, surface);
      }
      let feather = min((f - light.opts.x) * light.opts.y, 1.0);
      radiance = light.color.rgb * r * smoothstep(0.0, 1.0, feather);
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
