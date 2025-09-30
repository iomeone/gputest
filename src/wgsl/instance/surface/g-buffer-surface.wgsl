use '../../../wgsl/use/view'::{ getViewPosition, clipToWorld, to3D };
use '../../../wgsl/use/types'::{ SurfaceFragment };
use '../../../wgsl/codec/octahedral'::{ decodeOctahedral };

@link fn getAlbedo(uv: vec2<f32>) -> vec4<f32>;
@link fn getNormals(uv: vec2<f32>) -> vec4<f32>;
@link fn getMaterial(uv: vec2<f32>) -> vec4<f32>;
@link fn getEmissive(uv: vec2<f32>) -> vec4<f32>;
@link fn getDepth(uv: vec2<f32>) -> f32;

@export fn getGBufferSurface(
  uv: vec2<f32>,
  coord: vec4<f32>,
) -> SurfaceFragment {
  let albedo = getAlbedo(uv);
  let normals = getNormals(uv);
  let material = getMaterial(uv);
  let depth = getDepth(uv);

  let position = to3D(clipToWorld(vec4<f32>((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0), depth, 1.0)));
  let normal = decodeOctahedral(normals.xy);
  let bent = decodeOctahedral(normals.zw);

  return SurfaceFragment(
    vec4<f32>(position, 1.0),
    vec4<f32>(normal, 0.0),
    vec4<f32>(bent, albedo.w),
    vec4<f32>(albedo.xyz, 1.0),
    vec4<f32>(0.0),
    material,
    0.0,
  );
}
