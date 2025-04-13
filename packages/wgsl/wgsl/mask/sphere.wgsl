use '@use-gpu/wgsl/mask/sdf'::{ getUVScale, scaleSDF };
use '@use-gpu/wgsl/use/types'::{ DepthNormalFragment };

@export fn getSphereDepthNormal(uv: vec4<f32>) -> DepthNormalFragment {
  let xy = uv.xy * 2.0 - 1.0;
  let r = length(xy);

  let z = sqrt(max(0.0, 1 - r*r));
  let n = normalize(vec3<f32>(xy, z));

  let sdf = 1.0 - r;
  let s = getUVScale(uv.xy);
  let a = scaleSDF(sdf, s);

  let normal = vec4<f32>(n, 0.0);
  let alpha = select(select(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);
  let depth = z;

  return DepthNormalFragment(normal, alpha, depth);
}
