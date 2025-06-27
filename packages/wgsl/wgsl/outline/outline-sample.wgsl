use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use '@use-gpu/wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getViewPixelRatio };
use './outline-weight'::{ depthWeightPlus, normalWeight };

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;

@link fn getOverscanSize() -> vec2<f32>;
@link fn getOverscanScale() -> vec2<f32>;

@export fn getOutlineSample(targetUV: vec2<f32>) -> vec4<f32> {

  let overscanUV = targetUV * getOverscanScale() + (1.0 - getOverscanScale()) * .5;

  // Convert overscan UV to full size UV
  let sampleXY = vec2<i32>(overscanUV * getOverscanSize());

  // Load normals
  let nc = decodeNormal16(loadNormal16(vec2<u32>(sampleXY)));
  let nl = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(-1, 0))));
  let nr = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>( 1, 0))));
  let nt = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0, -1))));
  let nb = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0,  1))));

  let nwl = normalWeight(nl, nc);
  let nwr = normalWeight(nr, nc);
  let nwt = normalWeight(nt, nc);
  let nwb = normalWeight(nb, nc);

  let nw = min(min(nwl, nwr), min(nwt, nwb));

  // Load depths
  let dc = loadDepth(vec2<u32>(sampleXY));
  let dl = loadDepth(vec2<u32>(sampleXY + vec2<i32>(-1, 0)));
  let dr = loadDepth(vec2<u32>(sampleXY + vec2<i32>( 1, 0)));
  let dt = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0, -1)));
  let db = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0,  1)));

  let dw = depthWeightPlus(dc, dl, dr, dt, db);

  return vec4<f32>(1.0 - nw, 1.0 - dw, 0.0, 1.0);
};
