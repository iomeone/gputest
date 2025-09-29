use '@use-gpu/wgsl/use/view'::{ getViewPosition };
use '@use-gpu/wgsl/use/types'::{ SurfaceFragment };

@export fn getSolidFragment(
  surface: SurfaceFragment,
) -> vec4<f32> {
  let rgb = surface.albedo.rgb + surface.emissive.rgb;
  let a = surface.albedo.a;
  if (HAS_ALPHA_TO_COVERAGE) {
    return vec4<f32>(rgb, a);
  }
  else {
    return vec4<f32>(rgb * a, a);
  }
}
