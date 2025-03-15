use '@use-gpu/wgsl/use/view'::{ getViewNearFar, getViewPosition, getViewResolution, getViewSize, clipToWorld3D, clipUVToXY };

const BOUNCES = 2;
const SAMPLING = 2;

const MAX_SPHERES = 64;
const MAX_QUAD_VERTS = 64;

const SAMPLING_UNIFORM = 1;
const SAMPLING_COSINE = 2;

const PI = 3.141592;
const ZERO = vec3<f32>(0.0);

@link fn getFrameCount() -> u32;

@link fn getQuadCount() -> i32;
@link fn getQuadData(i: i32) -> vec4<f32>;

@link fn getSphereCount() -> i32;
@link fn getSphereData(i: i32) -> vec4<f32>;

@optional @link fn getMouse() -> vec2<u32>;
@optional @link fn getIsPicking() -> u32;

@optional @link fn printPoint(p: vec4<f32>, c: vec4<f32>);
@optional @link fn printLine(a: vec4<f32>, b: vec4<f32>, c: vec4<f32>);

struct RayHit {
  position: vec3<f32>,
  normal: vec3<f32>,
  distance: f32,
};

struct Surface {
  position: vec3<f32>,
  normal: vec3<f32>,
  distance: f32,

  gloss: f32,
  albedo: vec3<f32>,
};

////////////////////////////////////////////////////////

fn indic(v: f32) -> vec4<f32> {
  return vec4<f32>(-v, v * .1, v, 1.0);
};

fn yFlip(uv: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(uv.x, 1.0 - uv.y);
};

@export fn accumulateShader(uv: vec2<f32>) -> vec4<f32> {
  let k = getFrameCount();
  let alpha = select(0.0, 1.0, k == 0);

  let xy = vec2<u32>(uv * getViewSize());
  let isDebugPickingThis = getIsPicking() != 0 && all(xy == getMouse());

  let jitterX = noise3(vec3<u32>(xy, k * 2));
  let jitterY = noise3(vec3<u32>(xy, k * 2 + 1));
  let jitter = vec2<f32>(jitterX, jitterY) - .5;

  let resolution = getViewResolution();
  let eyePos = getViewPosition();

  let clipPos = vec4<f32>(clipUVToXY(uv + jitter * resolution), 0.0, 1.0);
  let targetPos = clipToWorld3D(clipPos);

  let globalAlbedo = .95;

  var color = vec3<f32>(0.0);
  var radiance = vec3<f32>(1.414);

  var ray = normalize(targetPos.xyz - eyePos.xyz);
  var origin = eyePos.xyz;

  var surface = raytrace(origin, ray, 0, isDebugPickingThis);
  if (surface.distance <= 0.0) {
    return vec4<f32>(skybox(ray), alpha);
  }

  for (var i = 0; i < BOUNCES; i++) {
    var reflected: vec3<f32>;

    // Uniform sampling
    // PDF of uniform hemisphere is 1/2π
    // Energy constant is 1/π
    // ∫ c/π cos θ * dɷ
    // ~= 2c/N ∑ Li * cos θ

    if (SAMPLING == SAMPLING_UNIFORM) {
      reflected = mix(bounceUniform(ray, surface.normal), bounceReflect(ray, surface.normal), surface.gloss);
      radiance *= 2.0 * dot(reflected, surface.normal) * surface.albedo * globalAlbedo;
    }

    // Cosine weighted sampling
    // PDF of cosine hemisphere is cos θ / π
    // ∫ c/π cos θ * dɷ
    // ~= c/N ∑ Li
    else if (SAMPLING == SAMPLING_COSINE) {
      reflected = mix(bounceCosine(ray, surface.normal), bounceReflect(ray, surface.normal), surface.gloss);
      radiance *= surface.albedo * globalAlbedo;
    }

    ray = normalize(reflected);
    origin = surface.position;

    surface = raytrace(origin, ray, i + 1, isDebugPickingThis);
    if (surface.distance <= 0.0) {
      color += skybox(ray) * radiance;
      break;
    }
  }

  return vec4<f32>(color, alpha);
};

////////////////////////////////////////////////////////

const SUN = vec3<f32>(1.0, 1.0, .85);

const SEA = vec3<f32>(.25, .4, .55);
const SKY = vec3<f32>(.35, .75, 1.0);
const GROUND = vec3<f32>(.2, .35, .2);

fn skybox(ray: vec3<f32>) -> vec3<f32> {
  let l = dot(ray, vec3<f32>(.447, .866, .224));

  return pow(max(0.0, l), 50.0) * SUN * 40.0
          + mix(GROUND, mix(SEA, SKY, max(0.0, ray.y)) * .75, pow(max(0.0, ray.y), 1.0/4.0));
}

////////////////////////////////////////////////////////

fn orthoVector(normal: vec3<f32>) -> vec3<f32> {
  let a = abs(normal);
  let m = max(max(a.x, a.y), a.x);

  let d = dot(a, vec3<f32>(1.0));
  let w = vec3<f32>(select(-1.0, 1.0, d > 0.5), 1.0, 1.0);

  return cross(normal.yzx * w, normal);
}

fn bounceUniform(ray: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
  let k = getFrameCount();

  let reflected = randomSphere(ray, k);
  return select(-reflected, reflected, dot(reflected, normal) > 0.0);
}

fn bounceReflect(ray: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
  return ray - 2.0 * dot(ray, normal) * normal;
}

fn bounceCosine(ray: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
  let k = getFrameCount();
  let hemi = randomSphereCosine(ray, k);

  let bx = normalize(orthoVector(normal));
  let by = cross(normal, bx);
  let bz = normal;

  let basis = mat3x3(bx, by, bz);

  return basis * normalize(hemi);
}

fn randomSphere(seed: vec3<f32>, frame: u32) -> vec3<f32> {
  let t = vec2(
    6.2831 * rand2(seed.xy, frame),
    acos(1.0 - 2.0 * rand2(seed.zy * 2.0, frame))
  );

  let ct = cos(t);
  let st = sin(t);

  return vec3<f32>(
    st.x * st.y,
    ct.x * st.y,
    ct.y);
}

fn randomSphereCosine(seed: vec3<f32>, frame: u32) -> vec3<f32> {
  let t = vec2<f32>(
    rand2(seed.xy, frame),
    rand2(seed.yz * 2.0, frame)
  );

  let r = sqrt(t.x);
  let th = 6.2831 * t.y;

  let x = cos(th) * r;
  let y = sin(th) * r;
  let z = sqrt(1.0 - t.x);

  return vec3<f32>(x, y, z);
}

fn rand2(xy: vec2<f32>, frame: u32) -> f32 {
  let ij = bitcast<vec2<u32>>(xy);
  return noise3(vec3<u32>(ij, frame));
}

fn noise3(ijk: vec3<u32>) -> f32 {
  let hash = xxhash32_3d(ijk);
  let noise = f32(hash) / 0xFFFFFFFF;
  return noise;
};

fn xxhash32_3d(p: vec3<u32>) -> u32 {
  let p2 = 2246822519u; let p3 = 3266489917u;
  let p4 = 668265263u; let p5 = 374761393u;
  var h32 =  p.z + p5 + p.x*p3;
  h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
  h32 += p.y * p3;
  h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
  h32 = p2 * (h32^(h32 >> 15));
  h32 = p3 * (h32^(h32 >> 13));
  return h32^(h32 >> 16);
}

////////////////////////////////////////////////////////

fn raytrace(
  origin: vec3<f32>,
  ray: vec3<f32>,
  
  bounce: i32,
  isDebugPickingThis: bool,
) -> Surface {
  let nearFar = getViewNearFar();
  let far = nearFar.y;

  var pos: vec3<f32> = ZERO;
  var normal: vec3<f32> = ZERO;
  var distance = far;

  var gloss: f32 = 0.0;
  var albedo: vec3<f32> = vec3<f32>(0.0);

  let numQuads = getQuadCount();
  let numSpheres = getSphereCount();

  for (var i = 0; i < MAX_SPHERES; i += 2) {
    if (i >= numSpheres) {
      break;
    }

    let s = getSphereData(i);
    let p = s.xyz;
    let r = s.w;

    let color = getSphereData(i + 1).xyz;

    let rayHit = intersectSphere(origin, ray, p, r);
    if (rayHit.distance >= 0 && rayHit.distance < distance) {
      pos = rayHit.position;
      normal = rayHit.normal;
      distance = rayHit.distance;

      gloss = sin(f32(i) * 77.51891671) * .25 + .25;
      albedo = color;
    }
  }

  for (var i = 0; i < MAX_QUAD_VERTS; i += 5) {
    if (i >= numQuads) {
      break;
    }

    let a = getQuadData(i).xyz;
    let b = getQuadData(i + 1).xyz;
    let c = getQuadData(i + 2).xyz;
    let d = getQuadData(i + 3).xyz;

    let color = getQuadData(i + 4).xyz;

    let rayHit = intersectQuad(origin, ray, a, b, c, d);
    if (rayHit.distance >= 0 && rayHit.distance < distance) {
      pos = rayHit.position;
      normal = rayHit.normal;
      distance = rayHit.distance;

      gloss = .01;
      albedo = color;
    }
  }

  if (HAS_DEBUG_PICKING && isDebugPickingThis) {
    let a = origin;
    let b = origin + select(1.0, distance, distance < far) * ray;

    var IN = vec3<f32>(0.5, 1.2, 1.0);
    let OUT = vec3<f32>(.2);
    for (var i = 0; i < bounce; i++) { IN = IN.yzx; }

    let c = mix(IN, OUT, distance / far);

    printPoint(vec4<f32>(b, 1.0), vec4<f32>(c, 1.0));
    printLine(vec4<f32>(a, 1.0), vec4<f32>(b, 1.0), vec4<f32>(c, 1.0));
  }

  if (distance >= far) {
    return Surface(ZERO, ZERO, -1.0, 0.0, vec3<f32>(0.0));
  }

  return Surface(pos, normal, distance, gloss, albedo);
}

fn intersectQuad(
  origin: vec3<f32>,
  ray: vec3<f32>,
  a: vec3<f32>,
  b: vec3<f32>,
  c: vec3<f32>,
  d: vec3<f32>,
) -> RayHit {
  let ab = b - a;
  let bc = c - b;
  let cd = d - c;
  let da = a - d;

  let normal = normalize(cross(ab, bc));

  let divisor = dot(normal, ray);
  if (divisor > -0.0001) { return RayHit(ZERO, ZERO, -1.0); }

  let distance = dot(a - origin, normal) / divisor;
  if (distance < 0.0001) { return RayHit(ZERO, ZERO, -1.0); }

  let pos = distance * ray + origin;
  if (dot(normal, cross(ab, pos - a)) < 0.0) { return RayHit(ZERO, ZERO, -1.0); }
  if (dot(normal, cross(bc, pos - b)) < 0.0) { return RayHit(ZERO, ZERO, -1.0); }
  if (dot(normal, cross(cd, pos - c)) < 0.0) { return RayHit(ZERO, ZERO, -1.0); }
  if (dot(normal, cross(da, pos - d)) < 0.0) { return RayHit(ZERO, ZERO, -1.0); }

  return RayHit(pos, normal, distance);
}

fn intersectSphere(
  origin: vec3<f32>,
  ray: vec3<f32>,
  center: vec3<f32>,
  radius: f32,
) -> RayHit {
  let pc = origin - center;

  // local ray
  let a = dot(ray, ray);
  let b = 2.0 * dot(pc, ray);
  let c = dot(pc, pc) - radius * radius;
  let d = b * b - 4.0 * a * c;

  if (d > 0.0) {
    let distance = (-b - sqrt(d)) / (2.0 * a);
    if (distance < 0.0) { return RayHit(ZERO, ZERO, -1.0); }

    let pos = distance * ray + origin;
    let normal = normalize(pos - center);

    return RayHit(pos, normal, distance);
  }

  return RayHit(ZERO, ZERO, -1.0);
}
