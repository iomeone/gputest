use '@use-gpu/wgsl/use/view'::{ clipUVToXY, to3D };
use '@use-gpu/wgsl/use/motion'::{ currentToLast };

@link fn getDepth(uv: vec2<f32>) -> f32;

@export fn getMotionSample(uv: vec2<f32>) -> vec2<f32> {
  let clipDepth = getDepth(uv);
  let clipXY = clipUVToXY(uv);
  let clip = vec4<f32>(clipXY, clipDepth, 1.0);

  let reprojected = to3D(currentToLast(clip));
  return vec2<f32>(clip.xy - reprojected.xy) * vec2<f32>(0.5, -0.5);
};

