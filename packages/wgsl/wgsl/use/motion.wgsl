@export struct MotionUniforms {
  reprojectionMatrix: mat4x4<f32>,
  inverseReprojectionMatrix: mat4x4<f32>,
};

@export @group(PASS) @binding(5) var<uniform> motionUniforms: MotionUniforms;

@export fn currentToLast(position: vec4<f32>) -> vec4<f32> {
  return motionUniforms.reprojectionMatrix * position;
}

@export fn lastToCurrent(position: vec4<f32>) -> vec4<f32> {
  return motionUniforms.inverseReprojectionMatrix * position;
}

