use '../../wgsl/use/types'::{ Light, SurfaceFragment };
use '../../wgsl/codec/octahedral'::{ encodeOctahedral, encodeHemiOctahedral };

@optional @link fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 { return 1.0; }

@export fn applySpotShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 {
  let index = u32(light.shadowMap);

  let pos = light.into * vec4<f32>(surface.position.xyz + surface.normal.xyz * light.shadowBias.z, 1.0);
  let dir = normalize(pos.xyz);

  let n = dot(surface.normal.xyz, dir);
  let slope = (1.0 - abs(n));

  let z = abs(pos.z) * (1.0 - light.shadowBias.x) - slope * light.shadowBias.y;

  let depth = dot(vec2<f32>(1.0, 1.0/z), light.shadowDepth);

  let blur = light.shadowBlur;

  let res = f32(blur) / (2.0 * (light.shadowUV.zw - light.shadowUV.xy) * SHADOW_PAGE);
  let uvm = clamp(pos.xy / abs(pos.z) * light.opts.z * .5 + .5, vec2<f32>(res), vec2<f32>(1.0 - res));
  let uv = mix(light.shadowUV.xy, light.shadowUV.zw, uvm);

  var s = 0.0;
  if (blur >= 4) {
    for (var y = -1.5; y <= 1.5; y += 1.0) {
      for (var x = -1.5; x <= 1.5; x += 1.0) {
        s += sampleShadow(uv + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 16.0;
  }
  else if (blur == 3) {
    for (var y = -1.0; y <= 1.0; y += 1.0) {
      for (var x = -1.0; x <= 1.0; x += 1.0) {
        s += sampleShadow(uv + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 9.0;
  }
  else if (blur == 2) {
    for (var y = -0.5; y <= 0.5; y += 1.0) {
      for (var x = -0.5; x <= 0.5; x += 1.0) {
        s += sampleShadow(uv + vec2<f32>(x, y) / SHADOW_PAGE, index, depth);
      }
    }
    s /= 4.0;
  }
  else {
    s += sampleShadow(uv, index, depth);
  }

  return s;
};
