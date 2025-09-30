use '@use-gpu/wgsl/use/types'::{ PickVertex };

@link fn getVertex(v: u32, i: u32) -> PickVertex {};
@optional @link fn getPicking(i: u32) -> vec2<u32> { return vec2<u32>(0u, 0u); };

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragScissor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
  @location(2) @interpolate(flat) fragId: u32,
  @location(3) @interpolate(flat) fragIndex: u32,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var v = getVertex(vertexIndex, instanceIndex);
  var p = getPicking(v.index);

  return VertexOutput(
    v.position,
    v.scissor,
    v.uv.xy,
    p.x,
    p.y,
  );
}
