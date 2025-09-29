@export fn getOrthoVector(v: vec3<f32>) -> vec3<f32> {
  let a = abs(v);
  if (a.x < a.y) {
    if (a.x < a.z) {
      return vec3<f32>(0.0, -v.z, v.y);
    }
    return vec3<f32>(-v.y, v.x, 0.0);
  }
  else {
    if (a.y < a.z) {
      return vec3<f32>(v.z, 0.0, -v.x);
    }
    return vec3<f32>(-v.y, v.x, 0.0);
  }
}
