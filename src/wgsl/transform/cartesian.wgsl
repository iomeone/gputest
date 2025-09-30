@optional @link fn getTransformMatrix(i: u32) -> mat4x4<f32> { };

@export fn getCartesianPosition(vector: vec4<f32>) -> vec4<f32> {
  return getTransformMatrix(0) * vec4<f32>(vector.xyz, 1.0);
}
