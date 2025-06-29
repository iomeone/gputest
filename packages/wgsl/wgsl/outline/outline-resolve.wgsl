use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use '@use-gpu/wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getViewPixelRatio };

@link fn loadEdge(xy: vec2<u32>) -> vec2<f32>;

@link fn getSize() -> vec2<f32>;

@link fn getInner() -> f32;
@link fn getOuter() -> f32;
@link fn getColor() -> vec3<f32>;

const LIMIT = 5;

@export fn getOutlineResolve(targetUV: vec2<f32>) -> vec4<f32> {

  // Convert to full size UV (overscan is already trimmed off)
  let sampleXY = vec2<i32>(targetUV * getSize());

  let inner = getInner();
  let outer = getOuter();
  let color = getColor();

  let di = 1 / f32(inner);
  let db = 1 / f32(outer);

  let n = min(LIMIT, i32(max(inner, outer)));

  let ec = loadEdge(vec2<u32>(sampleXY));
  let edge = vec3<f32>(ec.xy, 0.0);
  //return vec4<f32>(edge, 1.0);

  var accum = max(ec.r, ec.g);
  
  for (var i = 1; i < n; i++) {
    let el = loadEdge(vec2<u32>(sampleXY + vec2<i32>(-i, 0)));
    let er = loadEdge(vec2<u32>(sampleXY + vec2<i32>( i, 0)));
    let et = loadEdge(vec2<u32>(sampleXY + vec2<i32>(0, -i)));
    let eb = loadEdge(vec2<u32>(sampleXY + vec2<i32>(0,  i)));

    let e = max(max(el, er), max(et, eb));

    let f = f32(i);
    let ir = clamp(inner - f, 0.0, 1.0) * e.r;
    let or = clamp(outer - f, 0.0, 1.0) * e.g;
    accum += max(ir, or);
  }

  let a = clamp(accum, 0.0, 1.0);
  return vec4<f32>(color * a, a);
};
