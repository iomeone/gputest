@link fn getMatrix() -> mat4x4<f32>;

@export fn getCartesianPosition(position: vec4<f32>) -> vec4<f32> {
  let pos = vec4<f32>(position.xyz, 1.0);
  return getMatrix() * pos;
}
