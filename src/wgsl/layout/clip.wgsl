@optional @link fn applyTransform(p: vec4<f32>) -> vec4<f32> { return p; }

@link fn getParent(i: u32) -> vec4<f32>;
@optional @link fn getSelf(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

@export fn getCombinedClip(i: u32) -> vec4<f32> {
  let a = transformClip(getParent(i));
  let b = getSelf(i);
  return intersectClips(a, b);
}

@export fn getTransformedClip(i: u32) -> vec4<f32> {
  return transformClip(getParent(i));
}

fn transformClip(rect: vec4<f32>) -> vec4<f32> {
  let ul = applyTransform(vec4<f32>(rect.xy, 0.5, 1.0));
  let br = applyTransform(vec4<f32>(rect.zw, 0.5, 1.0));

  return vec4<f32>(ul.xy, br.xy);
}

fn intersectClips(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(max(a.xy, b.xy), min(a.zw, b.zw));
}
