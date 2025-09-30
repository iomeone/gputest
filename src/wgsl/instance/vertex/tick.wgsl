use '@use-gpu/wgsl/use/view'::{ worldToClip, getWorldScale, getViewScale };

@optional @link fn transformPosition(p: vec4<f32>) -> vec4<f32> { return p; };
@optional @link fn transformDifferential(v: vec4<f32>, b: vec4<f32>, c: bool) -> vec4<f32> { return v; };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getOffset(i: u32) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getSize(i: u32) -> f32 { return 5.0; };

@optional @link fn getTangent(i: u32) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getBase(i: u32) -> f32 { return 2.0; }

@export fn getTickPosition(index: u32) -> vec4<f32> {
  let n = u32(LINE_DETAIL + 1);
  let v = f32(index % n) / f32(LINE_DETAIL) - 0.5;

  let instanceIndex = index / n;

  let anchor = getPosition(instanceIndex);
  let offset = getOffset(instanceIndex);
  let depth = getDepth(instanceIndex);
  let size = getSize(instanceIndex);
  let tangent = getTangent(instanceIndex);
  let base = getBase(instanceIndex);

  let center = transformPosition(anchor);
  let c = worldToClip(center);
  let s = getWorldScale(c.w, depth) * getViewScale();

  if (length(tangent) > 0.0) {
    let diff = transformDifferential(tangent, anchor, false).xyz;

    let l = length(diff) * 0.999;
    let limit = s * size;
    let trunc = limit / l;

    let modulus = u32(round(pow(base, ceil(log(trunc)/log(base)))));
    if ((modulus > 1u) && ((instanceIndex % modulus) != 0u)) {
      return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
  }

  let adj = transformDifferential(offset, anchor, false).xyz;
  let normal = normalize(adj);

  return center + vec4<f32>(normal * size * v * s, 0.0);
}
