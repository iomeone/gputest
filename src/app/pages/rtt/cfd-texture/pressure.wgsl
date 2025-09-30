use '@use-gpu/wgsl/use/array'::{ wrapIndex2i };

@link fn getSize() -> vec2<u32> {};

@link var divergenceTexture: texture_2d<f32>;

@link var pressureTextureOut: texture_storage_2d<r32float, write>;
@link var pressureTextureIn: texture_2d<f32>;

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

  let p1 = textureLoad(pressureTextureIn, left, 0).x;
  let p2 = textureLoad(pressureTextureIn, right, 0).x;
  let p3 = textureLoad(pressureTextureIn, top, 0).x;
  let p4 = textureLoad(pressureTextureIn, bottom, 0).x;

  let div = textureLoad(divergenceTexture, center, 0).x;

  let p = (div + p1 + p2 + p3 + p4) / 4.0;

  textureStore(pressureTextureOut, center, vec4<f32>(p, 0.0, 0.0, 0.0));
}
