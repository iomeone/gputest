@optional @link fn getTexture(uv: vec2<f32>, sigma: f32) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getGain() -> f32 { return 1.0; };

const PI = 3.1415926536;
const TAU = 6.2831853072;

@export fn getEquiToCubeSample(uvw: vec3<f32>, sigma: f32) -> vec4<f32> {

  let phi = atan2(uvw.z, uvw.x);
  let theta = atan2(uvw.y, length(uvw.xz));

  let u = fract(phi / TAU);
  let v = fract(-theta / PI + .5);

  return getTexture(vec2<f32>(u, v), sigma) * getGain();
}
