use '@use-gpu/wgsl/use/array'::{ wrapIndex2i };

@link fn getSize() -> vec2<u32> {};

@link var curlTexture: texture_2d<f32>;

@link var velocityTextureOut: texture_storage_2d<rgba32float, write>;
@link var velocityTextureInPnHat: texture_2d<f32>;
@link var velocityTextureInPn1Hat: texture_2d<f32>;
@link var velocityTextureInPn: texture_2d<f32>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();

  if (any(globalId.xy >= size)) { return; }
  let center = vec2<i32>(globalId.xy);

  let pn = textureLoad(velocityTextureInPn, center, 0);
  let pn1hat = textureLoad(velocityTextureInPn1Hat, center, 0);
  let pnhat = textureLoad(velocityTextureInPnHat, center, 0);

  let pn1 = pn1hat + 0.5*(pn - pnhat);

  let xy = vec2<f32>(center) + pn.xy;
  let xyi = floor(xy);
  let ff = xy - xyi;
  let ij = vec2<i32>(xyi);


  let itl = wrapIndex2i(ij                  , size);
  let itr = wrapIndex2i(ij + vec2<i32>(1, 0), size);
  let ibl = wrapIndex2i(ij + vec2<i32>(0, 1), size);
  let ibr = wrapIndex2i(ij + vec2<i32>(1, 1), size);

  let tl = textureLoad(velocityTextureInPn, itl, 0);
  let tr = textureLoad(velocityTextureInPn, itr, 0);
  let bl = textureLoad(velocityTextureInPn, ibl, 0);
  let br = textureLoad(velocityTextureInPn, ibr, 0);

  var pmin = min(min(tl, tr), min(bl, br));
  var pmax = max(max(tl, tr), max(bl, br));
  var value = max(pmin, min(pmax, pn1));


  let il = wrapIndex2i(vec2<i32>(ij) + vec2<i32>(-1, 0), size);
  let ir = wrapIndex2i(vec2<i32>(ij) + vec2<i32>( 1, 0), size);
  let it = wrapIndex2i(vec2<i32>(ij) + vec2<i32>(0, -1), size);
  let ib = wrapIndex2i(vec2<i32>(ij) + vec2<i32>(0,  1), size);

  let cc = textureLoad(curlTexture, ij, 0).x;
  let cl = textureLoad(curlTexture, il, 0).x;
  let cr = textureLoad(curlTexture, ir, 0).x;
  let ct = textureLoad(curlTexture, it, 0).x;
  let cb = textureLoad(curlTexture, ib, 0).x;

  let cx = (abs(cr) - abs(cl));
  let cy = (abs(cb) - abs(ct));
  let cn = normalize(vec2<f32>(cx, cy) + 0.001);
  value = vec4<f32>(value.xy + vec2<f32>(-cn.y, cn.x) * vec2<f32>(cc) * 0.003, value.zw);


  textureStore(velocityTextureOut, center, value);
}
