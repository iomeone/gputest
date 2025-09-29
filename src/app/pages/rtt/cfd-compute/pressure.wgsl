use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2, wrapIndex2 };

@link fn getSize() -> vec2<u32> {};

@link var<storage> divergenceBuffer: array<f32>;

@link var<storage, read_write> pressureBufferOut: array<f32>;
@link var<storage> pressureBufferIn: array<f32>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();
  if (any(globalId.xy >= size)) { return; }
  let fragmentId = globalId.xy;

  let modulus = sizeToModulus2(size);
  let center = packIndex2(fragmentId, modulus);

  let left   = packIndex2(wrapIndex2(vec2<i32>(fragmentId) - vec2<i32>(1, 0), size), modulus);
  let right  = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>(1, 0), size), modulus);
  let top    = packIndex2(wrapIndex2(vec2<i32>(fragmentId) - vec2<i32>(0, 1), size), modulus);
  let bottom = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>(0, 1), size), modulus);

  let p1 = pressureBufferIn[left];
  let p2 = pressureBufferIn[right];
  let p3 = pressureBufferIn[top];
  let p4 = pressureBufferIn[bottom];

  let div = divergenceBuffer[center];

  let p = (div + p1 + p2 + p3 + p4) / 4.0;

  pressureBufferOut[center] = p;
}
