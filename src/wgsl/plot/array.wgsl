@link fn getSize(i: u32) -> vec4<u32> {};

@export fn unpackIndex(i: u32) -> vec4<u32> {
  let s = getSize(0u);
  
  let sxy = s.x * s.y;
  let sxyz = sxy * s.z;
  let modulus = vec4<u32>(s.x, sxy, sxyz, sxyz * s.w);

  return (i % modulus) / vec4<u32>(1u, modulus.xyz);
}

@export fn packIndex(v: vec4<u32>) -> u32 {
  let s = getSize(0u);
  return v.x + s.x * (v.y + s.y * (v.z + s.z * v.w));
}
