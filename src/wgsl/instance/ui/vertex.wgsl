use '@use-gpu/wgsl/use/view'::{ worldToClip };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };

struct VertexOutput {
  @builtin(position)              position: vec4<f32>;
  @location(0) @interpolate(flat) fragRectangle: vec4<f32>;
  @location(1) @interpolate(flat) fragRadius: vec4<f32>;
  @location(2) @interpolate(flat) fragMode: i32;
  @location(3) @interpolate(flat) fragBorder: vec4<f32>;
  @location(4) @interpolate(flat) fragStroke: vec4<f32>;
  @location(5) @interpolate(flat) fragFill: vec4<f32>;
  @location(6) @interpolate(flat) fragRepeat: i32;
  @location(7)                    fragUV: vec2<f32>;
  @location(8)                    fragTextureUV: vec2<f32>;
};

@external fn getRectangle(i: i32) -> vec4<f32>;
@external fn getRadius(i: i32) -> vec4<f32>;
@external fn getBorder(i: i32) -> vec4<f32>;
@external fn getFill(i: i32) -> vec4<f32>;
@external fn getStroke(i: i32) -> vec4<f32>;
@external fn getUV(i: i32) -> vec4<f32>;
@external fn getRepeat(i: i32) -> i32;

@stage(vertex)
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {

  var rectangle = getRectangle(i32(instanceIndex));
  var radius = getRadius(i32(instanceIndex));
  var border = getBorder(i32(instanceIndex));
  var fill = getFill(i32(instanceIndex));
  var stroke = getStroke(i32(instanceIndex));
  var uv4 = getUV(i32(instanceIndex));
  var repeat = getRepeat(i32(instanceIndex));

  var uv = getQuadUV(i32(vertexIndex));
  var position = vec4<f32>(mix(rectangle.xy, rectangle.zw, uv), 0.5, 1.0);
  var center = worldToClip(position);

  var texUV = mix(uv4.xy, uv4.zw, uv);

  var mode: i32;
  if (length(radius + border) == 0.0) { mode = 0; }
  else if (length(radius) == 0.0) { mode = 1; }
  else { mode = 2; };

  return VertexOutput(
    center,
    rectangle,
    radius,
    mode,
    border,
    stroke,
    fill,
    repeat,
    uv,
    texUV,
  );
}
