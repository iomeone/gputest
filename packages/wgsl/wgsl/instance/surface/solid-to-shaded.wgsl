use '@use-gpu/wgsl/use/types'::{ SolidVertex, ShadedVertex };
use '@use-gpu/wgsl/use/view'::{ clipToWorld3D };

@export fn solidToShaded(v: SolidVertex) -> ShadedVertex {
  let world = clipToWorld3D(v.position);
  return ShadedVertex(
    v.position,
    vec4<f32>(world, 1.0),
    vec4<f32>(0.0, 0.0, 1.0, 0.0),
    vec4<f32>(1.0, 0.0, 0.0, 0.0),
    v.color,
    v.uv,
    v.st,
    v.scissor,
    v.index,
  );
};
