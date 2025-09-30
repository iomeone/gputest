const ONE_TWO = vec2<u32>(1, 2);

@export fn bayer2x2(ij: vec2<u32>) -> u32 {
  let ij2 = ij & vec2<u32>(0x1u);

  let x = ij2.x;
  let xor = ij2.x ^ ij2.y;

  return (x | (xor << 1));
}

@export fn bayer4x4(ij: vec2<u32>) -> u32 {
  let ij4 = ij & vec2<u32>(0x3u);

  let x = ij4.x;
  let xor = ij4.x ^ ij4.y;

  let x12 = vec2<u32>(x) & ONE_TWO;
  let xor12 = vec2<u32>(xor) & ONE_TWO;

  return (xor12.x << 3) | (x12.x << 2) | xor12.y | (x12.y >> 1);
}

@export fn bayer2x2f(ij: vec2<u32>) -> f32 {
  return (0.5 + f32(bayer2x2(ij))) / 4.0;
}

@export fn bayer4x4f(ij: vec2<u32>) -> f32 {
  return (0.5 + f32(bayer4x4(ij))) / 16.0;
}
