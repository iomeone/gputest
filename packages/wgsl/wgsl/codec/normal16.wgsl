use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral, decodeOctahedral };

@export fn encodeNormal16(normal: vec3<f32>) -> vec2<u32> {
  let xy = encodeOctahedral(normal) * .5 + .5;
  return vec2<u32>(xy * 255.0);
}

@export fn decodeNormal16(n16: vec2<u32>) -> vec3<f32> {
  let xy = vec2<f32>(n16) / 255.0;
  return decodeOctahedral(xy * 2.0 - 1.0);
}
