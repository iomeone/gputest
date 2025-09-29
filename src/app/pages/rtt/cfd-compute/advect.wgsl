use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2, wrapIndex2 };

@link fn getSize() -> vec2<u32> {};

@link var<storage, read_write> velocityBufferOut: array<vec4<f32>>;
@link var<storage> velocityBufferIn: array<vec4<f32>>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();
  if (any(globalId.xy >= size)) { return; }
  let fragmentId = globalId.xy;

  let modulus = sizeToModulus2(size);
  let center = packIndex2(fragmentId, modulus);

  let sample = velocityBufferIn[center];
  let xy = vec2<f32>(fragmentId) + sample.xy * f32(TIME_STEP);

  let xyi = floor(xy);
  let ff = xy - xyi;
  let ij = vec2<i32>(xyi);

  let tl = velocityBufferIn[packIndex2(wrapIndex2(ij + vec2<i32>(0, 0), size), modulus)];
  let tr = velocityBufferIn[packIndex2(wrapIndex2(ij + vec2<i32>(1, 0), size), modulus)];
  let bl = velocityBufferIn[packIndex2(wrapIndex2(ij + vec2<i32>(0, 1), size), modulus)];
  let br = velocityBufferIn[packIndex2(wrapIndex2(ij + vec2<i32>(1, 1), size), modulus)];

  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);
  velocityBufferOut[center] = value;
}
