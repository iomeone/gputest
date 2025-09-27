@optional @link fn getMask(uv: vec2<f32>) -> f32 { return 1.0; };
@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };

@export fn getMaskedFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {
  let t = getTexture(uv.xy);
  let m = getMask(uv.xy);

  var c = color;
  
  if (HAS_ALPHA_TO_COVERAGE) {
    c = vec4<f32>(c.xyz * t.xyz, c.a * m * t.a);
  }
  else {
    c = c * t * clamp(m, 0.0, 1.0);
  }

  return c;
}
