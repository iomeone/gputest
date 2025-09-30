use '@use-gpu/wgsl/use/types'::{ UIVertex };

@link fn getVertex(v: u32, i: u32) -> UIVertex {};
@optional @link fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }

struct VertexOutput {
  @builtin(position)               position: vec4<f32>,
  @location(0)                     fragUV: vec2<f32>,
  @location(1)                     fragTextureUV: vec2<f32>,
  @location(2)                     fragTextureST: vec2<f32>,
  @location(3)                     fragClipUV: vec4<f32>,
  @location(4)                     fragSDFUV: vec2<f32>,
  @location(5)  @interpolate(flat) fragSDFConfig: vec4<f32>,
  @location(6)  @interpolate(flat) fragRepeat: i32,
  @location(7)  @interpolate(flat) fragMode: i32,
  @location(8)  @interpolate(flat) fragShape: vec4<f32>,
  @location(9)  @interpolate(flat) fragRadius: vec4<f32>,
  @location(10) @interpolate(flat) fragBorder: vec4<f32>,
  @location(11) @interpolate(flat) fragStroke: vec4<f32>,
  @location(12) @interpolate(flat) fragFill: vec4<f32>,
};

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  var v = getVertex(vertexIndex, instanceIndex);

  return VertexOutput(
    v.position,

    v.uv,
    v.textureUV,
    v.textureST,
    v.clipUV,
    v.sdfUV,
    v.sdfConfig,
    v.repeat,
    v.mode,
    v.shape,
    v.radius,
    v.border,
    toColorSpace(v.stroke),
    toColorSpace(v.fill),
  );
}
