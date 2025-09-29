use '@use-gpu/wgsl/use/view'::{ getViewPosition, clipToWorld, to3D };
use '@use-gpu/wgsl/use/types'::{ Light, SurfaceFragment };
use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral };

@link fn getAlbedo(uv: vec2<f32>) -> vec4<f32>;
@link fn getNormal(uv: vec2<f32>) -> vec4<f32>;
@link fn getMaterial(uv: vec2<f32>) -> vec4<f32>;
@link fn getEmissive(uv: vec2<f32>) -> vec4<f32>;
@link fn getDepth(uv: vec2<f32>) -> f32;

@export fn getEmissiveFragment(
  uv: vec2<f32>,
  index: u32,
) -> vec4<f32> {
  return getEmissive(uv);
}
