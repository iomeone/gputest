use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral, decodeOctahedral };

@export fn encodeNormal16(normal: vec3<f32>) -> vec4<u32> {
  let xy = encodeOctahedral(normal) * .5 + .5;
  return vec4<u32>(vec2<u32>(xy * 255.0), 0, 0);
}

@export fn decodeNormal16(n16: vec4<u32>) -> vec3<f32> {
  let xy = vec2<f32>(n16.xy) / 255.0;
  return decodeOctahedral(xy * 2.0 - 1.0);
}

@export fn octaToNormal16(octa: vec4<f32>) -> vec4<u32> {
  return vec4<u32>(vec2<u32>((octa.xy * .5 + .5) * 255.0), 0, 0);
}

@export fn octaToNormal(octa: vec4<f32>) -> vec3<f32> {
  return decodeOctahedral(octa.xy);
}
