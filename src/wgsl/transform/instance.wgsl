@link fn getIndirectTransformMatrix(i: u32) -> mat4x4<f32>;
@link fn getIndirectNormalMatrix(i: u32) -> mat3x3<f32>;

var<private> transformMatrix: mat4x4<f32>;
var<private> normalMatrix: mat3x3<f32>;

@export fn loadInstance(i: u32) {
  transformMatrix = getIndirectTransformMatrix(i);
  normalMatrix = getIndirectNormalMatrix(i);
}

@export fn getTransformMatrix() -> mat4x4<f32> { return transformMatrix; }
@export fn getNormalMatrix() -> mat3x3<f32> { return normalMatrix; }
