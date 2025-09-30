@link fn getTransformMatrix() -> mat4x4<f32>;

const PI = 3.14159265359;
const PI4 = 0.7853981634;
const toRad = 0.01745329252;
const limitLat = 85.05113;

@optional @link fn getWebMercatorBend() -> f32 { return 0.0; };
@optional @link fn getWebMercatorOrigin() -> vec3<f32> { return 0.0; };
@optional @link fn getWebMercatorZoom() -> f32 { return 0.0; };
@optional @link fn getWebMercatorRadius() -> f32 { return 0.0; };
@optional @link fn getWebMercatorCentered() -> f32 { return 0.0; };
@optional @link fn getWebMercatorNative() -> f32 { return 0.0; };

@export fn getWebMercatorPosition(position: vec4<f32>) -> vec4<f32> {
  let mercatorBend = getWebMercatorBend();
  let mercatorRadius = getWebMercatorRadius();
  let mercatorOrigin = getWebMercatorOrigin();
  let mercatorZoom = getWebMercatorZoom();
  let mercatorCentered = getWebMercatorCentered();
  let mercatorNative = getWebMercatorNative();

  let matrix = getTransformMatrix();

  let o = mercatorOrigin;
  var f = mercatorBend;
  let z = mercatorZoom;
  let n = mercatorNative;

  var transformed: vec3<f32>;

  var phi: f32; // longitude
  var theta: f32; // latitude
  var y: f32; // y

  if (f == 0.0) { f = 0.001; };
  if (f == 1.0) { f = 0.999; };

  if (n > 0.0) {
    let rads = position.xy * PI;
    y = rads.y;
    phi = rads.x;
    theta = (atan(exp(y)) - PI4) * 2.0;
  }
  else {
    phi = toRad * position.x;
    theta = toRad * position.y;
    y = log(tan(PI4 + theta / 2.0));
  }
  let radius = (mercatorRadius + position.z) / mercatorRadius;

  if (f < 1.0) {
    var proj = vec2<f32>(phi, y);

    if (f > 0.0) {
      let mixed = vec3<f32>(mix(vec2<f32>(phi, theta), proj, 1.0 - f), radius);

      if (f < 0.001) {
        transformed = toSphericalBendEpsilon(mixed, o, z, f);
      }
      else {
        transformed = toSphericalBend(mixed, o, z, f);
      }

      if (mercatorCentered > 0.0) {
        let mixed = vec3<f32>(
            mix(
              vec2<f32>(o.x * PI, o.z),
              vec2<f32>(o.x * PI, o.y * PI),
              1.0 - f
            ),
            radius,
          );
          if (f < 0.001) {
            transformed -= toSphericalBendEpsilon(mixed, o, z, f);
          }
          else {
            transformed -= toSphericalBend(mixed, o, z, f);
          }
      }
    }
    else {
      var flat = (proj / PI - o.xy) * z;
      transformed = vec3<f32>(flat, radius - 1.0);
    }
  }
  else {
    transformed = toSpherical(phi - o.x * PI, theta, radius * z / PI);
    if (mercatorCentered > 0.0) {
      transformed -= toSpherical(0.0, o.z, radius * z / PI);
    }
  }

  transformed = rotateToCenter(transformed, o, z, f);

  return matrix * vec4<f32>(transformed, 1.0);
}

fn toSpherical(phi: f32, theta: f32, radius: f32) -> vec3<f32> {
  let angles = vec2<f32>(phi, theta);
  let c = cos(angles);
  let s = sin(angles);

  let spherical = vec3<f32>(
    s.x * c.y,
    s.y,
    c.x * c.y,
  ) * radius;

  return spherical;
}

fn toSphericalBend(position: vec3<f32>, o: vec3<f32>, z: f32, f: f32) -> vec3<f32> {
  let f1 = 1.0 - f;
  let fi = 1.0 / f;

  let p = vec2<f32>((position.x - o.x * PI), position.y);
  let angles = p * f;

  let c = cos(angles);
  let s = sin(angles);

  var spherical = vec3<f32>(
    s.x * c.y * fi,
    s.y * fi,
    (c.x * c.y - 1.0) * fi + f,
  ) * z / PI;

  spherical.y -= o.y * z * f1;

  return spherical;
}

fn toSphericalBendEpsilon(position: vec3<f32>, o: vec3<f32>, z: f32, f: f32) -> vec3<f32> {
  let f1 = 1.0 - f;

  let p = vec2<f32>((position.x - o.x * PI), position.y);
  let angles = p * f;

  let c = 1.0 - angles * angles * .5;

  var spherical = vec3<f32>(
    p.x * c.y,
    p.y,
    f,
  ) * z / PI;

  spherical.y -= o.y * z * f1;

  return spherical;
}

fn rotateToCenter(position: vec3<f32>, o: vec3<f32>, z: f32, f: f32) -> vec3<f32> {
  let angle = mix(o.z, o.z, f) * f;
  let c = cos(angle);
  let s = sin(angle);

  return vec3<f32>(position.x, position.y * c - position.z * s, position.z * c + position.y * s);
}
