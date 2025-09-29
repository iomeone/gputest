use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadIndex };
use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };

@link fn getVertex(v: u32, i: u32) -> SolidVertex {};
@link fn getInstanceSize() -> u32 {};

@export fn getWireframeStripVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {
  var ij = getQuadIndex(vertexIndex);
  var xy = vec2<f32>(ij) * 2.0 - 1.0;

  var n = getInstanceSize();
  var f = instanceIndex % n;
  var i = instanceIndex / n;

  var stripIndex = getStripIndex(f);
  var edgeIndex = stripIndex.y;
  var triIndex = stripIndex.x;

  var a = getVertex(triIndex, i);
  var b = getVertex(triIndex + 1u + edgeIndex, i);

  var left = a.position.xyz / a.position.w;
  var right = b.position.xyz / b.position.w;

  if (a.position.w < 0.0 || b.position.w < 0.0) {
    return SolidVertex(
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      0u,
    );
  }
  
  var join: vec3<f32>;
  if (ij.x > 0u) {
    join = getLineJoin(left, left, right, 0.0, xy.y, 2.0, 1, 0);
  }
  else {
    join = getLineJoin(left, right, right, 0.0, xy.y, 2.0, 2, 0);
  }

  return SolidVertex(
    vec4<f32>(join, 1.0),
    vec4<f32>(1.0),
    vec4<f32>(0.0),
    vec4<f32>(0.0),
    vec4<f32>(1.0),
    0u,
  );
}
