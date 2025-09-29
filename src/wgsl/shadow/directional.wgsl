use '@use-gpu/wgsl/use/types'::{ Light, SurfaceFragment };

@optional @link fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 { return 1.0; }

@export fn applyDirectionalShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 {
  let index = u32(light.shadowMap);

  let pos = light.into * vec4<f32>(surface.position.xyz + surface.normal.xyz * light.shadowBias.y, 1.0);
  if (abs(pos.x) > 1 || abs(pos.y) > 1) {
    return 1.0;
  }

  let n = dot(surface.normal.xyz, light.normal.xyz);
  let slope = (1.0 - abs(n));

  let depth = pos.z + slope * light.shadowBias.x;
  let blur = light.shadowBlur;
  var s = 0.0;

  let res = f32(blur) / (2.0 * (light.shadowUV.zw - light.shadowUV.xy) * SHADOW_PAGE);
  let uv = clamp(pos.xy * .5 + .5, vec2<f32>(res), vec2<f32>(1.0 - res));
  let uvm = mix(light.shadowUV.xy, light.shadowUV.zw, uv);

  if (blur >= 4) {
    for (var y = -1.5; y <= 1.5; y += 1.0) {
      for (var x = -1.5; x <= 1.5; x += 1.0) {
        s += sampleShadow(uvm + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 16.0;
  }
  else if (blur == 3) {
    for (var y = -1.0; y <= 1.0; y += 1.0) {
      for (var x = -1.0; x <= 1.0; x += 1.0) {
        s += sampleShadow(uvm + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 9.0;
  }
  else if (blur == 2) {
    for (var y = -0.5; y <= 0.5; y += 1.0) {
      for (var x = -0.5; x <= 0.5; x += 1.0) {
        s += sampleShadow(uvm + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 4.0;
  }
  else {
    s += sampleShadow(uvm, index, depth);
  }
  
  return s;
};


