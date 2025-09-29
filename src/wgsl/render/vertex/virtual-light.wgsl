use '@use-gpu/wgsl/use/types'::{ LightVertex };

@link fn getVertex(i: u32) -> LightVertex {};
//@optional @link fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) @interpolate(flat) lightIndex: u32,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let v = getVertex(vertexIndex, instanceIndex);
  let p = v.position;

  return VertexOutput(
    p,
    v.index,
  );
}
