@export fn getScissorColor(color: vec4<f32>, min4: vec4<f32>) -> vec4<f32> {
  let min2 = min(min4.xy, min4.zw);
  let m = min(min2.x, min2.y);
  
  let dx = dpdx(m);
  let dy = dpdy(m);
  let l = (length(dx) + length(dy));

  let alpha = clamp(m / l, 0.0, 1.0);
  if (HAS_ALPHA_TO_COVERAGE) {
    return vec4<f32>(color.xyz, color.a * alpha);
  }
  else {
    return color * alpha;
  }
}

@export fn isScissored(min4: vec4<f32>) -> bool {
  let min2 = min(min4.xy, min4.zw);
  let m = min(min2.x, min2.y);
  return m < 0.0;
}
