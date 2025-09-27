use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadIndex };
use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };

@link fn getVertex(v: u32, i: u32) -> SolidVertex {};
@link fn getInstanceSize() -> u32 {};

@export fn getWireframeListVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {
  let vi = vertexIndex;
  var ij = getStripIndex(vi - (vi / 3u) * 2u);
  var xy = vec2<f32>(ij) * 2.0 - 1.0;

  var n = getInstanceSize();
  var f = instanceIndex % n;
  var i = instanceIndex / n;

  var v = u32(f) % 3u;
  var t = u32(f) - v;

  var ia: u32;
  var ib: u32;
  var ic: u32;
  if (v == 0u) {
    ia = t;
    ib = t + 1u;
    ic = t + 2u;
  }
  else if (v == 1u) {
    ia = t + 1u;
    ib = t + 2u;
    ic = t;
  }
  else if (v == 2u) {
    ia = t + 2u;
    ib = t;
    ic = t + 1u;
  }

  var a = getVertex(ia, i);
  var b = getVertex(ib, i);
  var c = getVertex(ic, i);
  
  if (a.position.w < 0.0 || b.position.w < 0.0 || c.position.w < 0.0) {
    var NaN: f32 = bitcast<f32>(0xffffffffu);
    return SolidVertex(
      vec4<f32>(NaN, NaN, NaN, NaN),
      vec4<f32>(NaN, NaN, NaN, NaN),
      vec4<f32>(NaN, NaN, NaN, NaN),
      vec4<f32>(NaN, NaN, NaN, NaN),
      0u,
    );
  }

  var left  = a.position.xyz / a.position.w;
  var right = b.position.xyz / b.position.w;
  var other = c.position.xyz / c.position.w;

  var join: vec3<f32>;
  if (ij.x > 0u) {
    join = getLineJoin(left, right, other, (f32(ij.x) - 1.0) / 2.0, xy.y, 2.0, 3, 2);
  }
  else {
    join = getLineJoin(other, left, right, 1.0, xy.y, 2.0, 3, 2);
  }

  return SolidVertex(
    vec4<f32>(join, 1.0),
    vec4<f32>(1.0, 1.0, 1.0, 1.0),
    vec4<f32>(0.0, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 0.0),
    0u,
  );
}
