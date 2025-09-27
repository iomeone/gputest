use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadIndex };
use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };

@external fn getVertex(v: u32, i: u32) -> SolidVertex {};
@external fn getInstanceSize() -> u32 {};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
};

@stage(vertex)
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {

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

  var join: vec3<f32>;
  if (ij.x > 0u) {
    join = getLineJoin(left, left, right, 0.0, xy.y, 2.0, 1, 0);
  }
  else {
    join = getLineJoin(left, right, right, 0.0, xy.y, 2.0, 2, 0);
  }

  return VertexOutput(
    vec4<f32>(join, 1.0),
    vec4<f32>(1.0, 1.0, 1.0, 1.0),
    vec2<f32>(0.0, 0.0),
  );
}
