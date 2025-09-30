@link var SH_DIFFUSE: array<vec3<f32>>;
@link var SH_SPECULAR: array<vec3<f32>>;

@export fn getDefaultEnvironment(
  uvw: vec3<f32>,
  sigma: f32,
  ddx: vec3<f32>,
  ddy: vec3<f32>,
) -> vec4<f32> {
  if (sigma < 0.0) {
    return vec4<f32>(sampleDiffuse(uvw), 1.0);
  }
  return vec4<f32>(sampleSpecular(uvw, sigma), 1.0);
}

fn sqr(x: f32) -> f32 { return x * x; }

fn sampleDiffuse(
  ray: vec3<f32>,
) -> vec3<f32> {

  // 2nd order SH
  let sample = max(
    vec3<f32>(0.0),
    SH_DIFFUSE[0] +
    SH_DIFFUSE[1] * ray.y +
    SH_DIFFUSE[2] * ray.z +
    SH_DIFFUSE[3] * ray.x +
    SH_DIFFUSE[4] * ray.y * ray.x +
    SH_DIFFUSE[5] * ray.y * ray.z +
    SH_DIFFUSE[6] * (3.0 * sqr(ray.z) - 1.0) +
    SH_DIFFUSE[7] * ray.x * ray.z +
    SH_DIFFUSE[8] * (sqr(ray.x) - sqr(ray.y))
  );

  return sample;
}

fn sampleSpecular(
  ray: vec3<f32>,
  sigma: f32,
) -> vec3<f32> {

  // Simulate rough detail at sigma size
  let s = 0.2;
  let f = clamp(1.0 - sigma / 0.336, 0.0, 1.0);
  let u = sin(ray / s);
  let v = cos(ray / s);
  let r = normalize(ray + (u.x*v.z + u.y*v.x + u.z*v.z*v.x) * s * f * f);

  // 3rd order SH
  let r2 = r * r;

  let sample = max(
    vec3<f32>(0.0),
    SH_SPECULAR[ 0] +
    SH_SPECULAR[ 1] * r.y +
    SH_SPECULAR[ 2] * r.z +
    SH_SPECULAR[ 3] * r.x +
    SH_SPECULAR[ 4] * r.y * r.x +
    SH_SPECULAR[ 5] * r.y * r.z +
    SH_SPECULAR[ 6] * (3.0 * sqr(r.z) - 1.0) +
    SH_SPECULAR[ 7] * r.x * r.z +
    SH_SPECULAR[ 8] * (sqr(r.x) - sqr(r.y)) +
    SH_SPECULAR[ 9] * r.y * (3 * r2.x - r2.y) +
    SH_SPECULAR[10] * r.x * r.y * r.z +
    SH_SPECULAR[11] * r.y * (5 * r2.z - 1) +
    SH_SPECULAR[12] * r.z * (5 * r2.z - 3) +
    SH_SPECULAR[13] * r.x * (5 * r2.z - 1) +
    SH_SPECULAR[14] * r.z * (r2.x - r2.y) +
    SH_SPECULAR[15] * r.x * (r2.x - 3 * r2.y)
  );

  return sample;
}
