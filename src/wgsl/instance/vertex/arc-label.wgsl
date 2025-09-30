use '../../../wgsl/use/view'::{ getViewResolution, worldToClip, getWorldScale, getViewPosition };

const SMOOTH_TANGENTS = true;

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getAnchor(i: u32) -> vec2<u32> { return vec2<u32>(0); };
@optional @link fn getArcLength(i: u32) -> f32 { return 0.0; };

@optional @link fn getNormal() -> vec3<f32> { return vec3<f32>(0.0, 1.0, 0.0); };

@export fn attachArcLabelTo(
  i: u32,
  shape: vec2<f32>,
  origin: vec2<f32>,
  rectangle: vec4<f32>,
  xy: vec2<f32>,
  depth: f32,
  scale: f32,
  offset: vec2<f32>,
  flip: vec2<f32>,
) -> vec4<f32> {

  // Get arc geometry
  let anchor = getAnchor(i);
  let totalLength = getArcLength(anchor.y);
  let normal = getNormal();

  // Sample midpoint + next point
  let mid1 = getPosition((anchor.x + anchor.y) / 2);
  let mid2 = getPosition((anchor.x + anchor.y) / 2 + 1);

  let center1 = worldToClip(mid1);
  let center2 = worldToClip(mid2);

  // Flip if layout is right-to-left
  var fl = flip;
  if (center1.x / center1.w > center2.x / center2.w) { fl = -fl; }

  // Lerp between fixed size and full perspective.
  let worldScale = getWorldScale(center1.w, depth) * scale;
  let lengthScale = worldScale / max(worldScale * shape.x / totalLength, 1.0);

  // Reference frame at center of glyph
  let centerXY = mix(rectangle.xy, rectangle.zw, .5);
  let refXY = ((centerXY + origin) * lengthScale + offset) * fl;
  let refU = refXY.x + totalLength / 2.0;

  // Sample arc pos/tangent
  let sample = sampleArc(anchor, refU, totalLength);
  let pt = sampleArcPositionTangent(anchor, sample.i, sample.f);

  // Final placement of glyph
  let finalXY = ((xy + origin) * lengthScale + offset) * fl;
  let finalUV = finalXY - refXY;

  let bitangent = cross(normal, pt.t);
  let worldPos = pt.p + pt.t * finalUV.x + bitangent * finalXY.y;

  return worldToClip(vec4<f32>(worldPos, 1.0));
};

struct ArcSample {
  i: u32,
  f: f32,
};

struct ArcPT {
  p: vec3<f32>,
  t: vec3<f32>,
};

fn sampleArc(anchor: vec2<u32>, at: f32, total: f32) -> ArcSample {
  var s = anchor.x;
  var e = anchor.y;

  var atc = clamp(at, 0.0, total);

  for (var i = 0; i < 8; i++) {
    let m = s + (e - s + 1) / 2;
    let v = getArcLength(m);

    if (v > atc) { e = m - 1; }
    else { s = m; }

    if (s == e) {
      break;
    }
  }

  let a = min(s, anchor.y - 1);
  let b = a + 1;

  let la = getArcLength(a);
  let lb = getArcLength(b);
  let f = (at - la) / (lb - la);

  return ArcSample(a, f);
}

fn sampleArcPositionTangent(anchor: vec2<u32>, index: u32, f: f32) -> ArcPT {
  let s = anchor.x;
  let e = anchor.y;

  let pa = getPosition(index).xyz;
  let pb = getPosition(index + 1).xyz;

  let pos = mix(pa, pb, f);
  var tgt: vec3<f32>;

  if (SMOOTH_TANGENTS) {
    let left = max(s + 1, index) - 1;
    let right = min(e, index + 1);

    let pl = getPosition(left).xyz;
    let pr = getPosition(right).xyz;

    let tgt1 = normalize(pb - pl);
    let tgt2 = normalize(pr - pa);

    tgt = normalize(mix(tgt1, tgt2, f));
  }
  else {
    tgt = normalize(pb - pa);
  }

  return ArcPT(pos, tgt);
};
