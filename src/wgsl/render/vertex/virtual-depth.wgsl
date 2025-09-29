use '@use-gpu/wgsl/use/types'::{ SolidVertex };

@link fn getVertex(v: u32, i: u32) -> SolidVertex {};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragScissor: vec4<f32>,
};

struct VertexOutputWithDepth {
  @builtin(position) position: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragPosition: vec4<f32>,
  @location(4) fragScissor: vec4<f32>,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,
    v.color.a,
    v.uv,
    v.st,
    v.scissor,
  );
}

@vertex
@export fn mainWithDepth(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutputWithDepth {
  let v = getVertex(vertexIndex, instanceIndex);

  return VertexOutputWithDepth(
    v.position,
    v.color.a,
    v.uv,
    v.st,
    v.world,
    v.scissor,
  );
}
