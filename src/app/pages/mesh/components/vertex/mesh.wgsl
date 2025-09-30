use '@use-gpu/wgsl/use/view'::{ worldToClip };

@optional @link fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
  @location(2) fragNormal: vec3<f32>,
  @location(3) fragPosition: vec3<f32>,
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

  return VertexOutput(
    outPosition,
    toColorSpace(color),
    uv,
    normal.xyz,
    position.xyz,
  );
}
