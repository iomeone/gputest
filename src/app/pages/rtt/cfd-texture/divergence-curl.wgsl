use '@use-gpu/wgsl/use/array'::{ wrapIndex2i };

@link fn getSize() -> vec2<u32> {};

@link var velocityTexture: texture_2d<f32>;

@link var divergenceTexture: texture_storage_2d<r32float, write>;
@link var curlTexture: texture_storage_2d<r32float, write>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();

  if (any(globalId.xy >= size)) { return; }
  let center = vec2<i32>(globalId.xy);

  let left   = wrapIndex2i(center - vec2<i32>(1, 0), size);
  let right  = wrapIndex2i(center + vec2<i32>(1, 0), size);
  let top    = wrapIndex2i(center - vec2<i32>(0, 1), size);
  let bottom = wrapIndex2i(center + vec2<i32>(0, 1), size);

  let vl = textureLoad(velocityTexture, left, 0);
  let vr = textureLoad(velocityTexture, right, 0);
  let vt = textureLoad(velocityTexture, top, 0);
  let vb = textureLoad(velocityTexture, bottom, 0);

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

  textureStore(divergenceTexture, center, vec4<f32>(div, 0.0, 0.0, 0.0));
  textureStore(curlTexture, center, vec4<f32>(curl, 0.0, 0.0, 0.0));
}
