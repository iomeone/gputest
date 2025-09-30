@link fn getIndirectTransformMatrix(i: u32) -> mat4x4<f32>;
@link fn getIndirectNormalMatrix(i: u32) -> mat3x3<f32>;

@optional @link fn getInstanceMap(i: u32) -> u32 { return i; }

var<private> transformMatrix: mat4x4<f32>;
var<private> normalMatrix: mat3x3<f32>;

@export fn loadInstance(i: u32) {
  let index = getInstanceMap(i);
  transformMatrix = getIndirectTransformMatrix(index);
  normalMatrix = getIndirectNormalMatrix(index);
}

@export fn getTransformMatrix() -> mat4x4<f32> { return transformMatrix; }
@export fn getNormalMatrix() -> mat3x3<f32> { return normalMatrix; }
