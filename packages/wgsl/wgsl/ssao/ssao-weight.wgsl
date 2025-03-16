@export fn normalWeight(a: vec3<f32>, b: vec3<f32>) -> f32 {
  return max(0.0, dot(a, b) * NORMAL_RAMP - (NORMAL_RAMP - 1.0));
}

@export fn depthWeight(a: f32, b: f32) -> f32 {
  return max(0.0,
    min(
      select(0.0, a / b, b > 0),
      select(0.0, b / a, a > 0),
    ) * DEPTH_RAMP - (DEPTH_RAMP - 1.0)
  );
}