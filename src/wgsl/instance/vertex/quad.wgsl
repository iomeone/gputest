use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/use/view'::{ viewUniforms, worldToClip, getPerspectiveScale }; 
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };

@external fn getPosition(i: i32) -> vec4<f32> {};
@external fn getColor(i: i32) -> vec4<f32> {};
@external fn getSize(i: i32) -> vec2<f32> {};
@external fn getDepth(i: i32) -> f32 {};

@export fn getQuadVertex(vertexIndex: i32, instanceIndex: i32) -> SolidVertex {
  var position = getPosition(instanceIndex);
  var color = getColor(instanceIndex);
  var size = getSize(instanceIndex);
  var depth = getDepth(instanceIndex);

  var center = worldToClip(position);

  var uv = getQuadUV(vertexIndex);
  var xy = uv * 2.0 - 1.0;
  
  // Lerp between fixed size and full perspective.
  var pixelScale = getPerspectiveScale(center.w, depth);
  // TODO: awaiting compound support
  //size *= pixelScale;
  size = size * pixelScale;

  if (HAS_EDGE_BLEED) {
    xy = xy * (size + 0.5) / size;
    uv = xy * .5 + .5;
  }

  // TODO: awaiting compound support
  //center.xy += xy * size * viewUniforms.viewResolution * center.w;
  center = vec4<f32>(center.xy + xy * size * viewUniforms.viewResolution * center.w, center.zw);

  return SolidVertex(
    center,
    color,
    uv
  );
}