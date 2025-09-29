use '@use-gpu/wgsl/use/view'::{ getViewPosition, clipToWorld, to3D };
use '@use-gpu/wgsl/use/types'::{ Light, SurfaceFragment };
use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral };

@link fn getAlbedo(uv: vec2<f32>) -> vec4<f32>;
@link fn getNormal(uv: vec2<f32>) -> vec4<f32>;
@link fn getMaterial(uv: vec2<f32>) -> vec4<f32>;
@link fn getEmissive(uv: vec2<f32>) -> vec4<f32>;
@link fn getDepth(uv: vec2<f32>) -> f32;

@link fn getLight(i: u32) -> Light;
@link fn applyLight(
  N: vec3<f32>,
  V: vec3<f32>,
  light: Light,
  surface: SurfaceFragment,
) -> vec3<f32>;

@export fn getLightFragment(
  uv: vec2<f32>,
  index: u32,
) -> vec4<f32> {
  let albedo = getAlbedo(uv);
  let normal = getNormal(uv);
  let material = getMaterial(uv);
  let depth = getDepth(uv);
  
  let position = to3D(clipToWorld(vec4<f32>((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0), depth, 1.0)));

  let surface = SurfaceFragment(
    vec4<f32>(position, 1.0),
    vec4<f32>(decodeOctahedral(normal.xy), 0.0),
    vec4<f32>(albedo.xyz, 1.0),
    vec4<f32>(0.0),
    material,
    albedo.w,
    0.0,
  );

  let viewPosition = getViewPosition().xyz;
  let surfacePosition = surface.position.xyz;
  let toView: vec3<f32> = viewPosition - surfacePosition;

  let N: vec3<f32> = normalize(surface.normal.xyz);
  let V: vec3<f32> = normalize(toView);

  let light = getLight(index);
  let output = applyLight(N, V, light, surface);

  return vec4<f32>(output, 1.0);
}
