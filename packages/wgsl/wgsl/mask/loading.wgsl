use '@use-gpu/wgsl/mask/sdf'::{ getUVScale, scaleSDF };

const PI = 3.1415926536;

@optional @link fn getAngle() -> f32 { return 0.0; }

@export fn getLoadingSpinnerMask(uv: vec2<f32>) -> f32 {
  let scale = getUVScale(uv);

  let xy = uv * 2.0 - 1.0;
  let r = length(xy);
  let th = -atan2(xy.y, xy.x);

  let sdf = min(1.0 - r, r - 0.8);
  let a = scaleSDF(sdf, scale);
  let f = fract((th / PI / 2.0) - getAngle());
  let alpha = max(0.0, f * 1.5 - .5);

  return a * alpha;
};

