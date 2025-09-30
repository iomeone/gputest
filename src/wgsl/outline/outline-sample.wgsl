use '../../wgsl/codec/normal16'::{ decodeNormal16, decodeNormal16Plus };
use '../../wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getViewPixelRatio };
use './outline-weight'::{ depthWeightPlus, normalWeight, facetWeight };

@link fn loadNormal16(xy: vec2<u32>, sample: u32) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>, sample: u32) -> f32;

@link fn getOverscanSize() -> vec2<f32>;
@link fn getOverscanScale() -> vec2<f32>;

@export fn getOutlineSample(targetUV: vec2<f32>) -> vec4<f32> {

  let overscanUV = mix(vec2<f32>(0.5), targetUV, getOverscanScale());

  // Convert overscan UV to full size UV
  let sampleXY = vec2<i32>(overscanUV * getOverscanSize());

  var s = vec2<f32>(0.0);

  for (var i = 0u; i < MSAA_SAMPLES; i++) {
    // Load normals
    var nc: vec3<f32>;
    var nl: vec3<f32>;
    var nr: vec3<f32>;
    var nt: vec3<f32>;
    var nb: vec3<f32>;

    let snc = loadNormal16(vec2<u32>(sampleXY), i);
    let snl = loadNormal16(vec2<u32>(sampleXY + vec2<i32>(-1, 0)), i);
    let snr = loadNormal16(vec2<u32>(sampleXY + vec2<i32>( 1, 0)), i);
    let snt = loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0, -1)), i);
    let snb = loadNormal16(vec2<u32>(sampleXY + vec2<i32>(0,  1)), i);

    var fw = 1.0;
    if (HAS_FACET) {
      let npc = decodeNormal16Plus(snc);
      let npl = decodeNormal16Plus(snl);
      let npr = decodeNormal16Plus(snr);
      let npt = decodeNormal16Plus(snt);
      let npb = decodeNormal16Plus(snb);

      fw = min(
        min(
          facetWeight(npl.index, npc.index),
          facetWeight(npr.index, npc.index),
        ),
        min(
          facetWeight(npt.index, npc.index),
          facetWeight(npb.index, npc.index),
        ),
      );

      nc = npc.normal;
      nl = npl.normal;
      nr = npr.normal;
      nt = npt.normal;
      nb = npb.normal;
    }
    else {
      nc = decodeNormal16(snc);
      nl = decodeNormal16(snl);
      nr = decodeNormal16(snr);
      nt = decodeNormal16(snt);
      nb = decodeNormal16(snb);
    }

    // Load depths
    let dc = loadDepth(vec2<u32>(sampleXY), i);
    let dl = loadDepth(vec2<u32>(sampleXY + vec2<i32>(-1, 0)), i);
    let dr = loadDepth(vec2<u32>(sampleXY + vec2<i32>( 1, 0)), i);
    let dt = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0, -1)), i);
    let db = loadDepth(vec2<u32>(sampleXY + vec2<i32>(0,  1)), i);

    // Get weights
    let lnc = length(vec2<f32>(snc.xy));
    let nwl = normalWeight(nl, nc);
    let nwr = normalWeight(nr, nc);
    let nwt = normalWeight(nt, nc);
    let nwb = normalWeight(nb, nc);

    let nw = select(1.0, min(min(min(nwl, nwr), min(nwt, nwb)), fw), lnc > 0.0);
    let dw = select(1.0, depthWeightPlus(dc, dl, dr, dt, db), dc > 0.0);

    s += vec2<f32>(1.0 - nw, 1.0 - dw);
  }

  return vec4<f32>(s / f32(MSAA_SAMPLES), 0.0, 1.0);
};
