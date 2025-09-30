use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral };
use './cube-grid'::{ getCubeGridOverlay }

@link fn getTexture(uv: vec3<f32>) -> vec4<f32>;

@export fn displayCubeAlpha(uv: vec2<f32>) -> vec4<f32> {
  var uvw: vec3<f32> = decodeOctahedral(uv * 2.0 - 1.0);

  let t = getTexture(uvw);

  let grid = getCubeGridOverlay(uvw);
  let tint = grid.xyz;
  let border = grid.a;

  return mix(vec4<f32>(vec3<f32>(t.a), 1.0), vec4<f32>(tint, 1.0), border * 0.5);
}
