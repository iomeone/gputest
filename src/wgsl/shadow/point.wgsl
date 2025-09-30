use '@use-gpu/wgsl/use/types'::{ Light, SurfaceFragment };
use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral };

@optional @link fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 { return 1.0; }

@export fn applyPointShadow(
  light: Light,
  surface: SurfaceFragment,
) -> f32 {
  let index = u32(light.shadowMap);

  let pos = light.into * vec4<f32>(surface.position.xyz + surface.normal.xyz * light.shadowBias.z, 1.0);
  let dir = normalize(pos.xyz);

  let n = dot(surface.normal.xyz, dir);
  let slope = (1.0 - abs(n));

  let a = abs(pos.xyz);
  let z = max(max(a.x, a.y), a.z) * (1.0 - light.shadowBias.x) - slope * light.shadowBias.y;

  let depth = dot(vec2<f32>(1.0, 1.0/z), light.shadowDepth);

  let blur = light.shadowBlur;
  var s = 0.0;

  let size = (light.shadowUV.zw - light.shadowUV.xy) * SHADOW_PAGE;
  let uvm = (encodeOctahedral(dir) * (size - f32(blur) * 2.0) / size) *.5 + .5;
  let uv = mix(light.shadowUV.xy, light.shadowUV.zw, uvm);

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
