use '@use-gpu/wgsl/use/view'::{ worldToClip };

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragScissor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
  @location(2) @interpolate(flat) fragId: u32,
  @location(3) @interpolate(flat) fragIndex: u32,
};

@vertex
fn main(
  @builtin(instance_index) instanceIndex: u32,
  @location(0) position: vec4<f32>,
  @location(1) normal: vec4<f32>,
  @location(2) color: vec4<f32>,
  @location(3) uv: vec2<f32>,
) -> VertexOutput {

  var outPosition: vec4<f32> = worldToClip(position);
  var fragIndex = u32(instanceIndex);

  return VertexOutput(
    outPosition,
    vec4<f32>(0.0),
    vec2<f32>(0.0),
    u32(PICKING_ID),
    fragIndex,
  );
}
