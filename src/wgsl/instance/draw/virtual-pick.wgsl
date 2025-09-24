use '@use-gpu/wgsl/use/types'::{ SolidVertex };

@external fn getVertex(v: i32, i: i32) -> SolidVertex {};

struct VertexOutput {
  @builtin(position) position: vec4<f32>;
  @location(0) @interpolate(flat) fragIndex: u32;
};

@stage(vertex)
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var v = getVertex(i32(vertexIndex), i32(instanceIndex));

  return VertexOutput(
    v.position,
    instanceIndex,
  );
}
