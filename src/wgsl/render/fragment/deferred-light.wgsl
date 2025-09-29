use '@use-gpu/wgsl/use/view':: { getViewResolution };

@link fn getFragment(uv: vec2<f32>) -> vec4<f32>;

@fragment
fn main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) @interpolate(flat) lightIndex: u32,
) -> @location(0) vec4<f32> {

  var uv = vec2<f32>(fragCoord.xy) * getViewResolution(); 
  var outColor = getFragment(uv, lightIndex);

  return vec4<f32>(outColor.rgb, 1.0);
}
