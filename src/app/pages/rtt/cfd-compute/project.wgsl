use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2, wrapIndex2 };

@link fn getSize() -> vec2<u32> {};

@link var<storage> pressureBuffer: array<f32>;

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

  let left   = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>(-1, 0), size), modulus);
  let right  = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>( 1, 0), size), modulus);
  let top    = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>(0, -1), size), modulus);
  let bottom = packIndex2(wrapIndex2(vec2<i32>(fragmentId) + vec2<i32>(0,  1), size), modulus);

  let p1 = pressureBuffer[left];
  let p2 = pressureBuffer[right];
  let p3 = pressureBuffer[top];
  let p4 = pressureBuffer[bottom];

  var sample = velocityBufferIn[center];

  sample.x -= .5 * (p2 - p1);
  sample.y -= .5 * (p4 - p3);
  sample.z *= 0.99999;

  velocityBufferOut[center] = sample;
}
