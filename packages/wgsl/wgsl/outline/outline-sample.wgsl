use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use '@use-gpu/wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getViewPixelRatio };
use './outline-weight'::{ depthWeightPlus, normalWeight };

@link fn loadNormal16(xy: vec2<u32>, sample: u32) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>, sample: u32) -> f32;

@link fn getOverscanSize() -> vec2<f32>;
@link fn getOverscanScale() -> vec2<f32>;

@export fn getOutlineSample(targetUV: vec2<f32>) -> vec4<f32> {

  //let overscanUV = mix(vec2<f32>(0.5), targetUV, getOverscanScale());
  let overscanUV = targetUV * getOverscanScale() + (1.0 - getOverscanScale()) * .5;

  // Convert overscan UV to full size UV
  let sampleXY = vec2<i32>(overscanUV * getOverscanSize());

  var s = vec2<f32>(0.0);

  for (var i = 0u; i < MSAA_SAMPLES; i++) {
    // Load normals
    let nc = decodeNormal16(loadNormal16(vec2<u32>(sampleXY), i));
    let nl = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(-1, 0)), i));
    let nr = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>( 1, 0)), i));
    let nt = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0, -1)), i));
    let nb = decodeNormal16(loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0,  1)), i));

    // Load depths
    let dc = loadDepth(vec2<u32>(sampleXY), i);
    let dl = loadDepth(vec2<u32>(sampleXY + vec2<i32>(-1, 0)), i);
    let dr = loadDepth(vec2<u32>(sampleXY + vec2<i32>( 1, 0)), i);
    let dt = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0, -1)), i);
    let db = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0,  1)), i);

    // Get weights
    let nwl = normalWeight(nl, nc);
    let nwr = normalWeight(nr, nc);
    let nwt = normalWeight(nt, nc);
    let nwb = normalWeight(nb, nc);

    let nw = min(min(nwl, nwr), min(nwt, nwb));
    let dw = depthWeightPlus(dc, dl, dr, dt, db);

    s += vec2<f32>(1.0 - nw, 1.0 - dw);
  }

  return vec4<f32>(s / f32(MSAA_SAMPLES), 0.0, 1.0);
};
