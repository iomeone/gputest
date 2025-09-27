@optional @link fn getSphericalBend() -> f32 { return 0.0; };
@optional @link fn getSphericalFocus() -> f32 { return 0.0; };
@optional @link fn getSphericalAspectX() -> f32 { return 1.0; };
@optional @link fn getSphericalAspectY() -> f32 { return 1.0; };
@optional @link fn getSphericalScaleY() -> f32 { return 0.0; };

@link fn getMatrix() -> mat4x4<f32>;

@export fn getSphericalPosition(position: vec4<f32>) -> vec4<f32> {
  let sphericalBend = getSphericalBend();
  let sphericalFocus = getSphericalFocus();
  let sphericalAspectX = getSphericalAspectX();
  let sphericalAspectY = getSphericalAspectY();
  let sphericalScaleY = getSphericalScaleY();

  let matrix = getMatrix();

  if (sphericalBend > 0.0001) {
    let xyz = position.xyz * vec3<f32>(sphericalBend, sphericalBend / sphericalAspectY * sphericalScaleY, sphericalAspectX);
    let radius = sphericalFocus + xyz.z;
    let cosine = cos(xyz.y) * radius;

    return matrix * vec4<f32>(
      sin(xyz.x) * cosine,
      sin(xyz.y) * radius * sphericalAspectY,
      (cos(xyz.x) * cosine - sphericalFocus) / sphericalAspectX,
      1.0
    );
  }
  else {
    return matrix * vec4<f32>(position.xyz, 1.0);
  }
}
