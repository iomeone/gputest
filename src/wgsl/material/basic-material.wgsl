@optional @link fn getColor() -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); }
@optional @link fn getColorMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }

@export fn getBasicMaterial(
  inColor: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> vec4<f32> {
  var color: vec4<f32> = inColor * getColor();

  if (HAS_COLOR_MAP) {
    color *= getColorMap(mapUV.xy);
  }

  return color;
}
