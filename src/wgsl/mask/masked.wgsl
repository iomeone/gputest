@optional @external fn getMask(uv: vec2<f32>) -> f32 { return 1.0; };
@optional @external fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };

@export fn getMaskedFragment(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {
  let t = getTexture(uv);
  let m = getMask(uv);

  if (HAS_ALPHA_TO_COVERAGE) {
    return vec4<f32>(color.xyz * t.xyz, color.a * m * t.a);
  }
  else {
    return color * t * m;
  }
}
