use '@use-gpu/wgsl/codec/octahedral'::{ encodeOctahedral };

const MAX_LAYERS_LOG = 8;

@link fn getLayerCount() -> u32;
@link fn getGain() -> f32;
@link fn getMapping(i: u32) -> vec4<u32>;
@link fn getSigma(i: u32) -> f32;

@link fn getTexture(uv: vec2<f32>, level: f32) -> vec4<f32>;

@link var<storage> shCoefficients: array<vec4<f32>>;

@optional @link fn getOverlay(xy: vec2<f32>, size1: vec2<f32>, sigma: f32) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn sampleEnvMap(
  uvw: vec3<f32>,
  sigma: f32,
  ddx: vec3<f32>,
  ddy: vec3<f32>,
) -> vec4<f32> {
  let gain = getGain();
  if (sigma < 0.0) {
    return vec4<f32>(gain * sampleDiffuse(uvw), 1.0);
  }

  // Convert UVW d/dx d/dy into arc size
  let df = abs(ddx) + abs(ddy);
  let dr = dot(uvw, normalize(uvw + df / 1.414));

  // approx: let scale = acos(dr);
  let scale = sqrt(2.0 * (1.0 - dr));
  let clamped = max(sigma, scale);

  let uv = encodeOctahedral(uvw) * .5 + .5;
  if (clamped < getSigma(0)) {
    return vec4<f32>(gain * sampleCubeMapLevel(uv, 0u, scale), 1.0);
  }

  // Binary search for right levels
  let count = getLayerCount();
  var start = 0u;
  var length = count;
  for (var i = 0u; i < MAX_LAYERS_LOG; i++) {
    var mid = start + length / 2u;
    var v = getSigma(mid);
    if (clamped > v) {
      length -= mid - start;
      start = mid;
    }
    else {
      length = length / 2u;
    }
    if (length == 1u) {
      break;
    }
  }

  let level = min(start, count - 2);

  let a = max(getSigma(level), 1e-5);
  let b = getSigma(level + 1);
  let f = max(0.0, (clamped - a) / (b - a));

  let s1 = sampleCubeMapLevel(uv, level, scale);
  let s2 = sampleCubeMapLevel(uv, level + 1, scale);

  return vec4<f32>(gain * mix(s1, s2, f), 1.0);
}

fn sampleDiffuse(
  ray: vec3<f32>,
) -> vec3<f32> {
  let sample = max(
    vec3<f32>(0.0),
    shCoefficients[0].xyz +
    shCoefficients[1].xyz * ray.y +
    shCoefficients[2].xyz * ray.z +
    shCoefficients[3].xyz * ray.x +
    shCoefficients[4].xyz * ray.y * ray.x +
    shCoefficients[5].xyz * ray.y * ray.z +
    shCoefficients[6].xyz * (3.0 * sqr(ray.z) - 1.0) +
    shCoefficients[7].xyz * ray.x * ray.z +
    shCoefficients[8].xyz * (sqr(ray.x) - sqr(ray.y))
  );

  return sample;
}

fn sampleCubeMapLevel(
  uv: vec2<f32>,
  level: u32,
  scale: f32,
) -> vec3<f32> {
  let mapping = vec4<f32>(getMapping(level));
  let size = mapping.zw - mapping.xy;

  let s = size - 1.0;
  let xy = uv * s + 0.5;

  // Debug overlay
  var o: vec4<f32>;
  if (OCTAHEDRAL_OVERLAY) {
    o = getOverlay(xy, s, scale);
  }

  if (FIX_BILINEAR_SEAM) {
    // Seam in diamond-shaped great circle where bilinear patches are not parallelograms
    let fxy = floor(xy - .5) + .5;
    let axy = abs(fxy * 2.0 - s);
    let diag = abs(s.x - axy.x - axy.y);

    let uvb = fxy + mapping.xy;
    let uvd = xy - fxy;

    if (diag < 1.0) {
      //let uvb = fxy + mapping.xy;
      //let uvd = xy - fxy;

      let signs = sign(uv - .5);
      let inv = max(vec2<f32>(0.0), -signs);
      let xy = uvd * signs + inv;

      let tl = getTexture(uvb +                               inv, 0.0).xyz;
      let tr = getTexture(uvb + vec2<f32>(1.0, 0.0) * signs + inv, 0.0).xyz;
      let bl = getTexture(uvb + vec2<f32>(0.0, 1.0) * signs + inv, 0.0).xyz;
      let br = getTexture(uvb + vec2<f32>(1.0, 1.0) * signs + inv, 0.0).xyz;

      let x = xy.x;
      let y = xy.y;
      let sum = x + y;
      let diff1 = x / (x + y);
      let diff2 = 1.0 - (1.0 - x) / (2.0 - x - y);
      let af = min(sum, 2 - sum);
      let bf = select(diff1, diff2, sum > 1.0);

      if (OCTAHEDRAL_OVERLAY) {
        let t = mix(vec3<f32>(1.0, 0.0, 0.0), mix(vec3<f32>(0.0, 1.0, 0.0), vec3<f32>(0.0, 0.0, 1.0), bf), af);
        return t * (1.0 - o.a) + o.rgb;
      }
      else {
        let corner = select(tl, br, sum > 1.0);
        let top = bl;
        let bottom = tr;
        return mix(corner, mix(top, bottom, bf), af);
      }
    }
  }

  let uvt = xy + mapping.xy;
  let t = getTexture(uvt, 0.0).xyz;

  if (OCTAHEDRAL_OVERLAY) { return t * (1.0 - o.a) + o.rgb; }
  else { return t; }
}

fn sqr(x: f32) -> f32 { return x * x; }