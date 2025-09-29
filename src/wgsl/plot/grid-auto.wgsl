use '@use-gpu/wgsl/use/view'::{ getViewPosition };

@link fn transformPosition(p: vec4<f32>) -> vec4<f32> {};

@link fn getGridAutoBase() -> vec4<f32>;
@link fn getGridAutoShift() -> vec4<f32>;

@export fn getGridAutoPosition() -> vec4<f32> {
  let base = getGridAutoBase();
  let shift = getGridAutoShift();
  
  var a = base;
  var b = base + shift;
  a = transformPosition(a);
  b = transformPosition(b);

  let v = getViewPosition();

  if (length(v.xyz - a.xyz) < length(v.xyz - b.xyz)) { return shift; }
  return vec4<f32>(0.0);
}
