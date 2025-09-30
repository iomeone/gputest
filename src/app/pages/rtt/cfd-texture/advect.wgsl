use '@use-gpu/wgsl/use/array'::{ wrapIndex2i };

@link fn getSize() -> vec2<u32> {};

@link var velocityTextureOut: texture_storage_2d<rgba32float, write>;
@link var velocityTextureIn: texture_2d<f32>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();

  if (any(globalId.xy >= size)) { return; }
  let center = vec2<i32>(globalId.xy);

  let sample = textureLoad(velocityTextureIn, center, 0);
  let xy = vec2<f32>(center) + sample.xy * f32(TIME_STEP);

  let xyi = floor(xy);
  let ff = xy - xyi;
  let ij = vec2<i32>(xyi);

  let itl = wrapIndex2i(ij                  , size);
  let itr = wrapIndex2i(ij + vec2<i32>(1, 0), size);
  let ibl = wrapIndex2i(ij + vec2<i32>(0, 1), size);
  let ibr = wrapIndex2i(ij + vec2<i32>(1, 1), size);

  let tl = textureLoad(velocityTextureIn, itl, 0);
  let tr = textureLoad(velocityTextureIn, itr, 0);
  let bl = textureLoad(velocityTextureIn, ibl, 0);
  let br = textureLoad(velocityTextureIn, ibr, 0);

  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);
  textureStore(velocityTextureOut, center, value);
}
