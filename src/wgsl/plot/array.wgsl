use '@use-gpu/wgsl/use/array'::{ sizeToModulus4, packIndex4, unpackIndex4 }

@link fn getSize() -> vec4<u32> {};

@export fn unpackIndex(i: u32) -> vec4<u32> {
  let s = getSize();
  let modulus = sizeToModulus4(s);
  return unpackIndex4(i, modulus);
}

@export fn packIndex(v: vec4<u32>) -> u32 {
  let s = getSize();
  let modulus = sizeToModulus4(s);
  return packIndex4(v, modulus);
}
