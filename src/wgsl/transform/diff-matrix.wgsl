@link fn getTransformMatrix(i: u32) -> mat4x4<f32>;
@link fn getNormalMatrix(i: u32) -> mat3x3<f32>;

@export fn getMatrixDifferential(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32> {
  if (contravariant) { return vec4<f32>(getNormalMatrix(0u) * vector.xyz, vector.w); }
  let v4 = getTransformMatrix(0u) * vec4<f32>(vector.xyz, 0.0);
  return vec4<f32>(v4.xyz, vector.w);
}
