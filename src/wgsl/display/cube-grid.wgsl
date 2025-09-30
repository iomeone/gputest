@export fn getCubeGridOverlay(uvw: vec3<f32>) -> vec4<f32> {
  var tint = vec3<f32>(0.0, 0.0, 0.0);

  let a = abs(uvw);
  var b: vec2<f32>;

  if (a.x > a.y) {
    if (a.x > a.z) {
      b = uvw.yz / a.x;
      if (uvw.x > 0.0) {
        tint.r += 1.0;
      }
      else {
        tint.r += 1.0;
        tint.g += 0.5;
      }
    }
    else {
      b = uvw.xy / a.z;
      if (uvw.z > 0.0) {
        tint.b += 1.0;
        tint.g += 0.25;
      }
      else {
        tint.b += 1.0;
        tint.r += 0.5;
        tint.g += 0.25;
      }
    }
  }
  else {
    if (a.y > a.z) {
      b = uvw.xz / a.y;
      if (uvw.y > 0.0) {
        tint.g += 1.0;
      }
      else {
        tint.g += 1.0;
        tint.b += 0.5;
      }
    }
    else {
      b = uvw.xy / a.z;
      if (uvw.z > 0.0) {
        tint.b += 1.0;
        tint.g += 0.25;
      }
      else {
        tint.b += 1.0;
        tint.r += 0.5;
        tint.g += 0.25;
      }
    }
  }
  let border = clamp(50.0 * (max(abs(b.x), abs(b.y)) - 0.9), 0.0, 1.0);

  return vec4<f32>(tint, border);
};
