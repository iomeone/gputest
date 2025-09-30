use '@use-gpu/wgsl/use/view'::{ getViewPosition };

@optional @link fn transformPosition(p: vec4<f32>) -> vec4<f32> { return p; };

@export fn getGridAutoState(base: vec4<f32>, shift: vec4<f32>) -> bool {
  let v = getViewPosition().xyz;

  let p1 = transformPosition(base).xyz;
  let p2 = transformPosition(base + shift * 0.001).xyz;

  let n = p2 - p1;
  let d = dot(v - p1, n);
  return d > 0;
}


