use '../../wgsl/codec/octahedral'::{ encodeOctahedral, decodeOctahedral };

@export fn encodeNormal16(normal: vec3<f32>) -> vec4<u32> {
  let xy = encodeOctahedral(normal) * .5 + .5;
  return vec4<u32>(vec2<u32>(xy * 255.0), 0, 0);
}

@export fn decodeNormal16(n16: vec4<u32>) -> vec3<f32> {
  let xy = vec2<f32>(n16.xy) / 255.0;
  return decodeOctahedral(xy * 2.0 - 1.0);
}

@export fn encodeNormal16Plus(normal: vec3<f32>, index: u32) -> vec4<u32> {
  let xy = encodeOctahedral(normal) * .5 + .5;
  let zw = vec2<u32>(index >> 8, index & 0xFF);
  return vec4<u32>(vec2<u32>(xy * 255.0), zw);
}

struct NormalIndex {
  normal: vec3<f32>,
  index: u32,
};

@export fn decodeNormal16Plus(n16: vec4<u32>) -> NormalIndex {
  let xy = vec2<f32>(n16.xy) / 255.0;
  let index = (n16.z << 8) | n16.w;
  return NormalIndex(decodeOctahedral(xy * 2.0 - 1.0), index);
}

@export fn octaToNormal16(octa: vec4<f32>) -> vec4<u32> {
  return vec4<u32>(vec2<u32>((octa.xy * .5 + .5) * 255.0), 0, 0);
}

@export fn octaToNormal(octa: vec4<f32>) -> vec3<f32> {
  return decodeOctahedral(octa.xy);
}
