use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2, wrapIndex2 };

@link fn getSize() -> vec2<u32> {};

@link var<storage> velocityBuffer: array<vec4<f32>>;

@link var<storage, read_write> divergenceBuffer: array<f32>;
@link var<storage, read_write> curlBuffer: array<f32>;

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

  let vl = velocityBuffer[left];
  let vr = velocityBuffer[right];
  let vt = velocityBuffer[top];
  let vb = velocityBuffer[bottom];

  let ux1 = vl.x;
  let ux2 = vr.x;
  let vy1 = vt.y;
  let vy2 = vb.y;
  let div = -((ux2 - ux1) + (vy2 - vy1)) * .5;

  let uy1 = vl.y;
  let uy2 = vr.y;
  let vx1 = vt.x;
  let vx2 = vb.x;
  let curl = -((uy2 - uy1) - (vx2 - vx1)) * .5;

  divergenceBuffer[center] = div;
  curlBuffer[center] = curl;
}
