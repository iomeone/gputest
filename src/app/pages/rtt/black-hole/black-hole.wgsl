use '../../../../wgsl/mask/sdf'::{ getUVScale, getUVWScale };

const PI = 3.1415926536;
const TAU = 6.2831853072;

const DISTORT = true;
const RK = true;
const STEP = 0.1;

const MAX_STEPS = 192;

@optional @link fn getExposure() -> f32 { return 1.0; };

@optional @link fn getSeed() -> i32 { return 0; };
@optional @link fn getTime() -> f32 { return 0.0; };

@optional @link fn getRed() -> f32 { return 1.0; };
@optional @link fn getGreen() -> f32 { return 1.0; };
@optional @link fn getBlue() -> f32 { return 1.0; };

@optional @link fn getBackdrop(uvw: vec3<f32>) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn traceVolumeBH(
  pos: vec3<f32>,
  ray: vec3<f32>,
  distMax: f32,
) -> vec4<f32> {

  let plane = vec3<f32>(0.0, 1.0, 0.0);
  let offset = 0.0;

  let k = -(dot(plane, pos) - offset) / dot(plane, ray);

  if (!DISTORT) {
    let p = pos + k * ray;
    let uv = p.xz;

    let time = getTime();
    let disc = getDisc(uv, time);

    let env = getBackdrop(ray);
    return disc + env;
  }
  
  else {
    let rgba = raymarchVolume(pos, ray);
    return rgba;
  }
};

// Geodesic raymarcher
fn raymarchVolume(
  pos: vec3<f32>,
  ray: vec3<f32>,
) -> vec4<f32> {
  
  let time = getTime();
  
  let nc = cross(pos, ray);
  let h2 = dot(nc, nc);

  var p = pos;
  var v = ray;
  
  var rgba: vec4<f32> = vec4<f32>(0.0);

  var i: i32 = 0;
  for (; i < MAX_STEPS; i++) {
    let uv1 = p.xz;
    let py = p.y;

    let step = STEP * (length(p) + 1);

    if (RK) {
      // Runge-Kutta-4
      let pm = mat2x3(p, v);

      let k1 = getAcceleration2(pm, h2);
      let k2 = getAcceleration2(pm + k1 * (step / 2.0), h2);
      let k3 = getAcceleration2(pm + k2 * (step / 2.0), h2);
      let k4 = getAcceleration2(pm + k3 * step, h2);
      
      let s = step / 6.0 * (k1 + 2 * k2 + 2 * k3 + k4);

      v += s[1];
      p += s[0];

      if (py * p.y < 0.0) {
        let uv2 = p.xz;
        let uv = mix(uv1, uv2, -py / (p.y - py));
        let disc = getDisc(uv, time);
        rgba += disc;
      }
    }
    else {
      // Leapfrog
      p += v * step;
    
      if (py * p.y < 0.0) {
        let disc = getDisc(p.xz, time);
        rgba += disc;
      }

      let a = getAcceleration(p, h2);
      v += a * step;
    }
    
    if (length(p) < 1.5 && dot(p, v) < 0.0) {
      rgba.a = 1.0;
      break;
    }
  }

  rgba *= getExposure();

  // Feather off deflection near edges
  let dr = length(pos - ray * dot(pos, ray));
  let feather = smoothstep(17.0, 31.0, dr);
  v = mix(v, ray, feather);

  // Add ray backdrop
  let env = getBackdrop(v);
  if (rgba.a < 1.0) {
    rgba += env;
    rgba.a = 1.0;
  }

  return rgba;
}

fn getAcceleration(pos: vec3<f32>, h2: f32) -> vec3<f32> {
  return -1.5 * h2 * pos * pow(dot(pos, pos), -2.5);
}

fn getAcceleration2(pv: mat2x3<f32>, h2: f32) -> mat2x3<f32> {
  return mat2x3(
    pv[1],
    -1.5 * h2 * pv[0] * pow(dot(pv[0], pv[0]), -2.5),
  );
}

// Fake accretion disc
fn getDisc(uv: vec2<f32>, t: f32) -> vec4<f32> {
  let r = length(uv);
  let th = atan2(uv.y, uv.x) + PI;

  let rt = vec2<f32>(r / 4.0, th) / TAU + vec2<f32>(0, t);

  var uvl = rt;
  var accum = vec4<f32>(0.0);
  var scale = 1.0;
  var weight = 1.0;

  //let band = smoothstep(0.75, 0.0, abs(r - 1.0));
  let band = smoothstep(0.0, 1.0, min(r * 2.0 + 0.1, 9.0 - r) / 6.0);

  for (var i = 0; i < 12; i++) {
    let nm = gradientNoiseDeriv(uvl, u32(i + getSeed()), scale);
    
    let n = nm[0];
    let dnx = nm[1];
    let dny = nm[2];

    // Noise gated by derivative cross product
    let g = smoothstep(0.0, 1.0, -dnx.x * n.x * .5 + band);
    let c = max(vec3<f32>(0.0), (dnx.y * .5 + .5) * weight * cross(dnx.xzw, dny.wxy));
    
    let v = mix(1.0 - accum, vec4<f32>(1.0), 0.5);

    let d = vec4<f32>(c, length(c)) * v;
    accum += d;
    accum = mix(d, accum, g);

    // Fake advection + per-layer velocity
    uvl = uvl * 2.0 + dnx.yz * n.w * vec2<f32>(.125, .65) + vec2<f32>(0, t) * scale;

    scale *= 2.0;
    weight = weight / 1.4142135624;
  }
  
  // Color shift
  let c = accum * band;

  let red = 2.0 - getRed();
  let green = 2.0 - getGreen();
  let blue = 2.0 - getBlue();

  let cr = pow(c.r + c.g*c.g*c.g + c.b*c.b, red);
  let cg = pow(c.r*c.r + c.g + c.b*c.b*c.b, green);
  let cb = pow(c.r*c.r*c.r + c.g*c.g + c.b, blue);

  let mv = (cr + cg + cb) / 3.0;
  let mr = mix(mv, cr, getRed());
  let mg = mix(mv, cg, getGreen());
  let mb = mix(mv, cb, getBlue());

  //let cr = c.r + c.g*c.g + c.b*c.b;
  //let cg = c.r + c.g*c.g + c.b;
  //let cb = c.r*c.r + c.g + c.b;
  let ca = c.a;
  
  return vec4<f32>(mr, mg, mb, ca);
}

fn gradientNoiseDeriv(uv: vec2<f32>, s: u32, w: f32) -> mat3x4<f32> {

  let uv00 = floor(uv);
  let uv10 = uv00 + vec2<f32>(1.0, 0.0);
  let uv01 = uv00 + vec2<f32>(0.0, 1.0);
  let uv11 = uv00 + vec2<f32>(1.0, 1.0);

  let x00 = randSignedWrapped4(uv00, s, 0, w);
  let x01 = randSignedWrapped4(uv01, s, 0, w);
  let x10 = randSignedWrapped4(uv10, s, 0, w);
  let x11 = randSignedWrapped4(uv11, s, 0, w);

  let y00 = randSignedWrapped4(uv00, s, 1, w);
  let y01 = randSignedWrapped4(uv01, s, 1, w);
  let y10 = randSignedWrapped4(uv10, s, 1, w);
  let y11 = randSignedWrapped4(uv11, s, 1, w);

  let duv00 = uv - uv00;
  let duv01 = uv - uv01;
  let duv10 = uv - uv10;
  let duv11 = uv - uv11;

  let w00 = x00 * duv00.x + y00 * duv00.y;
  let w01 = x01 * duv01.x + y01 * duv01.y;
  let w10 = x10 * duv10.x + y10 * duv10.y;
  let w11 = x11 * duv11.x + y11 * duv11.y;
  
  let f = uv - uv00;

  let suv = f*f*f*(f*(f*6.0-15.0)+10.0);
  let sduv = 30.0*f*f*(f*(f-2.0)+1.0);

  let v = w00 + suv.x * (w10 - w00) + suv.y * (w01 - w00) + suv.x * suv.y * (w00 - w10 - w01 + w11);
  let x = x00 + suv.x * (x10 - x00) + suv.y * (x01 - x00) + suv.x * suv.y * (x00 - x10 - x01 + x11) + sduv.x * (suv.y * (w00 - w10 - w01 + w11) + w10 - w00);
  let y = y00 + suv.x * (y10 - y00) + suv.y * (y01 - y00) + suv.x * suv.y * (y00 - y10 - y01 + y11) + sduv.y * (suv.x * (w00 - w10 - w01 + w11) + w01 - w00);
  
  return mat3x4(v, x, y);
};

fn randSignedWrapped4(uv: vec2<f32>, i: u32, j: u32, w: f32) -> vec4<f32> {
  let cu = uv.x;
  let cv = fract(uv.y / w) * w;

  let xy = vec2<u32>(vec2<f32>(cu, cv) + f32(0x10000));
  let v = pcg4d(vec4<u32>(xy, i, j));

  let xyzw = vec4<f32>(v) / 0xFFFFFFFF;
  return xyzw * 2.0 - 1.0;
}

fn pcg4d(seed: vec4<u32>) -> vec4<u32> {
  var v = seed * 1664525u + 1013904223u;
  v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
  v = v ^ (v >> vec4<u32>(16u));
  v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
  return v;
}

