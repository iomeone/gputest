@infer type T;

@link fn getVertex(v: u32, i: u32) -> @infer(T) T {};

@optional @link fn getFacet(index: u32) -> u32 { return 0; };

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragAlpha: f32,
  @location(1) fragUV: vec4<f32>,
  @location(2) fragST: vec4<f32>,
  @location(3) fragNormal: vec4<f32>,
  @location(4) fragTangent: vec4<f32>,
  @location(5) fragPosition: vec4<f32>,
  @location(6) fragScissor: vec4<f32>,
  @location(7) @interpolate(flat) fragFacetId: u32,
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
    v.normal,
    v.tangent,
    v.world,
    v.scissor,
    getFacet(v.index),
  );
}
