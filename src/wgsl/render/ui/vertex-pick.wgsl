use '@use-gpu/wgsl/use/view'::{ worldToClip };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };

struct VertexOutput {
  @builtin(position)              position: vec4<f32>,
  @location(0) @interpolate(flat) fragRectangle: vec4<f32>,
  @location(1) @interpolate(flat) fragRadius: vec4<f32>,
  @location(2) @interpolate(flat) fragMode: i32,
  @location(3) @interpolate(flat) fragIndex: u32,
  @location(4)                    fragUV: vec2<f32>,
};

@external fn getRectangle(i: u32) -> vec4<f32>;
@external fn getRadius(i: u32) -> vec4<f32>;
@external fn getUV(i: u32) -> vec4<f32>;

@stage(vertex)
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {

  var rectangle = getRectangle(instanceIndex);
  var radius = getRadius(instanceIndex);

  var uv = getQuadUV(vertexIndex);
  var position = vec4<f32>(mix(rectangle.xy, rectangle.zw, uv), 0.5, 1.0);
  var center = worldToClip(position);

  var mode: i32;
  if (length(radius + border) == 0.0) { mode = 0; }
  else if (length(radius) == 0.0) { mode = 1; }
  else { mode = 2; };

  return VertexOutput(
    center,
    rectangle,
    radius,
    fragMode,
    instanceIndex,
    uv,
  );
}
