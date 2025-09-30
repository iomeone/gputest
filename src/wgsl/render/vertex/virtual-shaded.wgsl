use '@use-gpu/wgsl/use/types'::{ ShadedVertex };

@link fn getVertex(v: u32, i: u32) -> ShadedVertex {};
@optional @link fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,
    toColorSpace(v.color),
    v.uv,
    v.st,
    v.normal,
    v.tangent,
    v.world,
    v.scissor,
  );
}
