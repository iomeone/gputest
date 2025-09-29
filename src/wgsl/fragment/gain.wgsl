@link fn getGain() -> f32;

@export fn gainColor(color: vec4<f32>) -> vec4<f32> {
  var rgb = color.rgb * getGain();
  if (IS_OPAQUE) { return vec4<f32>(rgb, 1.0); }
  else { return vec4<f32>(rgb * getGain(), color.a); }
};
