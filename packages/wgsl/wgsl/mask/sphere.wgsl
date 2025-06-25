use '@use-gpu/wgsl/mask/sdf'::{ getUVWScale };
use '@use-gpu/wgsl/use/types'::{ DepthNormalFragment };
use '@use-gpu/wgsl/use/view'::{ getViewVector, worldToDepth, worldToW };

@export fn traceSphereQuad(
  uv: vec4<f32>,
  st: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  position: vec4<f32>,
  coord: vec4<f32>,
) -> DepthNormalFragment {

  // Sphere encoded in tangent component
  let center = tangent.xyz;
  let radius = tangent.w;

  let origin = position.xyz;
  let view = getViewVector(position.xyz);
  let direction = normalize(view);

  // SDF AA range
  let dr = 1.414 / getUVWScale(position.xyz);

  // Distance from ray to center
  let dp = origin - center;
  let b = dot(direction, dp);
  let d = length(dp - b * direction);
  if (d > radius + dr) {
    return DepthNormalFragment(normal, 0.0, 0.0);
  }

  // Extend radius for anti-aliasing (ray always hits)
  let r = max(radius, d);
  let c = dot(dp, dp) - r * r;

  // Solve intersection
  let det = max(0.0, b * b - c);
  let t = -(b - sqrt(det));

  // Apply edge SDF
  let sdf = radius - d;
  let a = clamp((sdf * dr) + .5, 0.0, 1.0);

  // Sphere point
  let world = origin + direction * t;
  let worldNormal = normalize(world - center);
  let outNormal = vec4<f32>(worldNormal, 0.0);

  let alpha = select(select(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);
  let depth = worldToDepth(vec4<f32>(world.xyz, 1.0));

  return DepthNormalFragment(outNormal, alpha, depth);
}
