use '@use-gpu/wgsl/use/types'::{ PickVertex };

@link fn getVertex(v: u32, i: u32) -> PickVertex {};
@optional @link fn getId() -> u32 { return 0u; };

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) @interpolate(flat) fragId: u32,
  @location(1) @interpolate(flat) fragIndex: u32,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,
    getId(),
    v.index,
  );
}
