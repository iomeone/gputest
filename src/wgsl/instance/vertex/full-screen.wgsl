use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };
use '@use-gpu/wgsl/use/view'::{ getViewSize };

//  0        1      2
//    +------.------/
//    |      .    /
//    |      .  /
//  1 ......../
//    |     /
//    |   /
//    | /
//  2 /

@export fn getFullScreenVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {
  var c = getViewSize(); // Ensure view uniforms are used

  var uv = getQuadUV(vertexIndex);
  var xy = uv * 2.0 - 1.0;

  return SolidVertex(
    vec4<f32>(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),
    vec4<f32>(1.0, 1.0, 1.0, 1.0),
    vec4<f32>(uv * 2.0, 0.0, 0.0),
    vec4<f32>(0.0),
    vec4<f32>(1.0),
    instanceIndex,
  );
}