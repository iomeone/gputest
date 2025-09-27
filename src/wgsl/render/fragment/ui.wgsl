@link fn getFragment(
  fragUV: vec2<f32>,
  fragTextureUV: vec2<f32>,
  fragSDFUV: vec2<f32>,
  fragSDFConfig: vec4<f32>,
  fragRepeat: i32,
  fragMode: i32,
  fragLayout: vec4<f32>,
  fragRadius: vec4<f32>,
  fragBorder: vec4<f32>,
  fragStroke: vec4<f32>,
  fragFill: vec4<f32>,
) -> vec4<f32> {};

@fragment
fn main(
  @location(0)                     fragUV: vec2<f32>,
  @location(1)                     fragTextureUV: vec2<f32>,
  @location(2)                     fragClipUV: vec4<f32>,
  @location(3)                     fragSDFUV: vec2<f32>,
  @location(4)  @interpolate(flat) fragSDFConfig: vec4<f32>,
  @location(5)  @interpolate(flat) fragRepeat: i32,
  @location(6)  @interpolate(flat) fragMode: i32,
  @location(7)  @interpolate(flat) fragLayout: vec4<f32>,
  @location(8)  @interpolate(flat) fragRadius: vec4<f32>,
  @location(9)  @interpolate(flat) fragBorder: vec4<f32>,
  @location(10) @interpolate(flat) fragStroke: vec4<f32>,
  @location(11) @interpolate(flat) fragFill: vec4<f32>,
) -> @location(0) vec4<f32> {

  return getFragment(
    fragUV,
    fragTextureUV,
    fragClipUV,
    fragSDFUV,
    fragSDFConfig,
    fragRepeat,
    fragMode,
    fragLayout,
    fragRadius,
    fragBorder,
    fragStroke,
    fragFill,
  );
}