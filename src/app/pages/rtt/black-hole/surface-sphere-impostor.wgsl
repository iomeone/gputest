use '../../../../wgsl/use/types'::{ SurfaceFragment, DepthFragment };
use '../../../../wgsl/use/view'::{ getViewPosition, worldToDepth };

@link fn getMatrix() -> mat4x4<f32>;
@link fn getRayMatrix() -> mat3x3<f32>;
@link fn getNormalMatrix() -> mat3x3<f32>;

@link fn getCenter() -> vec3<f32>;
@link fn getSize() -> vec3<f32>;

@link fn getIsInside() -> f32;
@link fn getInsideOrigin() -> vec3<f32>;

@infer type T;
@link fn traceVolumeRay(
  pos: vec3<f32>,
  ray: vec3<f32>,
  distMax: f32,
) -> @infer(T) T;

@export fn getSphereImpostorSurface(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> SurfaceFragment {
  let surface = traceFromSphere(position, uv);

  let m = getMatrix();
  let n = getNormalMatrix();
  let worldPosition = m * vec4<f32>(surface.position, 1.0);

  let worldNormal = vec4<f32>(n * surface.normal, 0.0);
  let occlusion = vec4<f32>(worldNormal.xyz, 1.0);
  let depth = worldToDepth(worldPosition);

  let a = surface.albedo.a;
  if (a <= 0.0) { discard; }

  return SurfaceFragment(
    worldPosition,
    worldNormal,
    occlusion,
    surface.albedo,
    surface.emissive,
    surface.pbr,
    depth,
  );
}

@export fn getSphereImpostorDepth(
  alpha: f32,
  uv: vec4<f32>,
  st: vec4<f32>,
  position: vec4<f32>,
) -> DepthFragment {
  let surface = traceFromSphere(position, uv);
  if (surface.albedo.a <= 0.0) { discard; }

  let m = getMatrix();
  let worldPosition = m * vec4<f32>(surface.position, 1.0);
  let depth = worldToDepth(worldPosition);

  return DepthFragment(alpha, depth);
}

@export fn getSphereImpostorEmissive(
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
) -> vec4<f32> {
  let m = getMatrix();
  let position = m * uv;

  return traceFromSphere(position, uv);
}

fn traceIntoSphere(origin: vec3<f32>, ray: vec3<f32>, center: vec3<f32>, size: vec3<f32>) -> T {
  let s = max(size.x, max(size.y, size.z));
  
  // Minimum/maximum trace distance
  let dp = origin - center;
  let ry = ray;

  let b = dot(ray, dp);  
  let c = dot(dp, dp) - s * s;

  let det = max(0.0, b * b - c);

  let t1 = -(b + sqrt(det));
  let t2 = -(b - sqrt(det));
  
  let distMin = max(0.001, t1);
  let distMax = max(0.001, t2);

  // Ray start
  let pos: vec3<f32> = origin + ray * distMin;

  return traceVolumeRay(pos, ray, distMax);
}

fn traceFromSphere(position: vec4<f32>, uv: vec4<f32>) -> T {
  let viewPosition = getViewPosition();
  let surfacePosition = position.xyz;
  let toSurface = surfacePosition * viewPosition.w - viewPosition.xyz;

  let r = getRayMatrix();
  let s = getSize();
  let c = getCenter();

  let ray = normalize(r * toSurface);

  if (getIsInside() > 0.0) {
    return traceIntoSphere(getInsideOrigin(), ray, c, s);
  }
  else {
    let origin = uv.xyz;
    return traceIntoSphere(origin, ray, c, s);
  }
}
