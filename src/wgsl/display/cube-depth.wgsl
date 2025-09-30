use '../../wgsl/codec/octahedral'::{ decodeOctahedral };
use './cube-grid'::{ getCubeGridOverlay };
use './depth'::{ displayDepth };

@link fn getTexture(uv: vec3<f32>) -> vec4<f32>;

@export fn displayCubeDepth(uv: vec2<f32>) -> vec4<f32> {
  var uvw: vec3<f32> = decodeOctahedral((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0));

  let t = getTexture(uvw);

  let grid = getCubeGridOverlay(uvw);
  let tint = grid.xyz;
  let border = grid.a;

  let depthColor = displayDepth(t.x);
  return mix(depthColor, vec4<f32>(tint, 1.0), border * 0.5);
}
