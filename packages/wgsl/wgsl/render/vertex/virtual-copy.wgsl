use '@use-gpu/wgsl/use/types'::{ SolidVertex };

@link fn getVertex(v: u32, i: u32) -> Vertex {};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragUV: vec2<f32>,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,
    v.uv.xy,
  );
}
