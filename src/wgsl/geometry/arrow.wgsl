use '@use-gpu/wgsl/use/view'::{ getWorldScale, getViewScale };

const ARROW_ASPECT: f32 = 2.5;

fn sqr(f: f32) -> f32 { return f * f; };

@export fn getArrowSize(maxLength: f32, width: f32, size: f32, both: i32, w: f32, depth: f32) -> f32 {
  if (w <= 0.0) { return 0.0; }
  
  let worldScale = getWorldScale(w, depth) * getViewScale();

  let targetSize = size * width * worldScale * 0.5;
  var maxSize = maxLength / ARROW_ASPECT;
  if (both > 0) { maxSize = maxSize * 0.5; }

  let ratio = maxSize / targetSize;
  var finalSize = targetSize;
  if (ratio < 2.0) { finalSize = targetSize * (1.0 - sqr(1.0 - ratio * 0.5)); }

  return finalSize;
};

@export fn getArrowCorrection(w1: f32, w2: f32, depth: f32) -> f32 {
  return mix(w1 / w2, 1.0, depth);
};

