use '@use-gpu/wgsl/use/types'::{ PickVertex };

@external fn getVertex(v: u32, i: u32) -> PickVertex {};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) @interpolate(flat) fragIndex: u32,
};

@stage(vertex)
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,
    v.index,
  );
}
