@optional @link fn applyTransform(p: vec4<f32>) -> vec4<f32> { return p; }

@export fn transformRectangle(rect: vec4<f32>) -> vec4<f32> {
  let ul = applyTransform(vec4<f32>(rect.xy, 0.5, 1.0));
  let br = applyTransform(vec4<f32>(rect.zw, 0.5, 1.0));

  return vec4<f32>(ul.xy, br.xy);
}
