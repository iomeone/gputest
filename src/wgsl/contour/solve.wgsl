@export fn approx3x3(system: mat3x4<f32>) -> vec3<f32> {
  let trace = abs(vec3<f32>(system[0][0], system[1][1], system[2][2]));
  let maxAxis = max(trace.x, max(trace.y, trace.z));

  if (maxAxis == trace.x) {
    if (trace.y > trace.z) {
      return orthogonalize3x3(system, 0u, 1u, 2u);
    }
    else {
      return orthogonalize3x3(system, 0u, 2u, 1u);
    }
  }
  else if (maxAxis == trace.y) {
    if (trace.x > trace.z) {
      return orthogonalize3x3(system, 1u, 0u, 2u);
    }
    else {
      return orthogonalize3x3(system, 1u, 2u, 0u);
    }
  }
  else {
    if (trace.x > trace.y) {
      return orthogonalize3x3(system, 2u, 0u, 1u);
    }
    else {
      return orthogonalize3x3(system, 2u, 1u, 0u);
    }
  }
}

const eps = 1.0e-2;

fn orthogonalize3x3(
  matrix: mat3x4<f32>,
  i: u32,
  j: u32,
  k: u32,
) -> vec3<f32> {
  var v1 = matrix[i];
  var v2 = matrix[j];
  var v3 = matrix[k];

  let id1 = 1.0 / dot(v1.xyz, v1.xyz);
  var projected = v1.xyz * (v1.w * id1);

  v2 = v2 - v1 * (dot(v2.xyz, v1.xyz) * id1);
  v3 = v3 - v1 * (dot(v3.xyz, v1.xyz) * id1);

  let id2 = 1.0 / dot(v2.xyz, v2.xyz);
  let id3 = 1.0 / dot(v3.xyz, v3.xyz);
  if (id2 < id3) {
    if (id1 / id2 > eps) {
      projected += v2.xyz * (v2.w * id2);

      v3 = v3 - v2 * (dot(v3.xyz, v2.xyz) * id2);
      let id3 = 1.0 / dot(v3.xyz, v3.xyz);
      if (id1 / id3 > eps) {
        projected += v3.xyz * (v3.w * id3);
      }
    }
  }
  else {
    if (id1 / id3 > eps) {
      projected += v3.xyz * (v3.w * id3);

      v2 = v2 - v3 * (dot(v2.xyz, v3.xyz) * id3);
      let id2 = 1.0 / dot(v2.xyz, v2.xyz);
      if (id1 / id2 > eps) {
        projected += v2.xyz * (v2.w * id2);
      }
    }
  }

  /*
  let ap = abs(projected) * 2.0;
  let maxAbs = max(ap.x, max(ap.y, ap.z));
  if (maxAbs > 1.0) { return projected / maxAbs; }
  */
  return projected;
}
