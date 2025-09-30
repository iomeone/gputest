@optional @link fn getTransformMatrix(i: u32) -> mat4x4<f32> { };
@optional @link fn getTransformBase(i: u32) -> vec4<f32> { };

@export fn getCartesian4DPosition(vector: vec4<f32>) -> vec4<f32> {
  return getTransformMatrix(0) * vector + getTransformBase(0);
}

