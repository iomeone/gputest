@optional @link fn getMask(uv: vec2<f32>) -> f32 { return 1.0; };

@export fn getMaskedColor(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
) -> vec4<f32> {
  let m = getMask(uv.xy);
  return vec4<f32>(color.xyz, color.a * m);
}

@export fn getMaskedSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> vec4<f32> {
  let m = getMask(uv.xy);
  return vec4<f32>(color.xyz, color.a * m);
}
