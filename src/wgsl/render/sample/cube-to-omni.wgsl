use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral, wrapOctahedral };

@link fn getTexture(uvw: vec3<f32>) -> vec4<f32>;
@optional @link fn getScale() -> vec2<f32> { return vec2<f32>(1.0); };

@export fn getCubeToOmniSample(outColor: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {
  let oct = wrapOctahedral((uv.xy * 2.0 - 1.0) * getScale());
  let uvw: vec3<f32> = decodeOctahedral(oct);
  return getTexture(uvw);
}
