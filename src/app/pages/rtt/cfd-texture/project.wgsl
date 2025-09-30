use '@use-gpu/wgsl/use/array'::{ wrapIndex2i };

@link fn getSize() -> vec2<u32> {};

@link var pressureTexture: texture_2d<f32>;

@link var velocityTextureOut: texture_storage_2d<rgba32float, write>;
@link var velocityTextureIn: texture_2d<f32>;

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

  let p1 = textureLoad(pressureTexture, left, 0).x;
  let p2 = textureLoad(pressureTexture, right, 0).x;
  let p3 = textureLoad(pressureTexture, top, 0).x;
  let p4 = textureLoad(pressureTexture, bottom, 0).x;

  var sample = textureLoad(velocityTextureIn, center, 0);

  sample.x -= .5 * (p2 - p1);
  sample.y -= .5 * (p4 - p3);
  sample.z *= 0.99999;
  sample.w *= 0.99999;

  textureStore(velocityTextureOut, center, sample);
}
