use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/use/view'::{ getViewResolution, worldToClip, getPerspectiveScale, getViewScale, applyZBias }; 
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getRectangle(i: u32) -> vec4<f32> { return vec4<f32>(-1.0, -1.0, 1.0, 1.0); };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };
@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };

@export fn getQuadVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {
  var position = getPosition(instanceIndex);
  var rectangle = getRectangle(instanceIndex);
  var color = getColor(instanceIndex);
  var depth = getDepth(instanceIndex);
  var rectangleUV = getUV(instanceIndex);
  var zBias = getZBias(instanceIndex);

  var center = worldToClip(position);

  var uv1 = getQuadUV(vertexIndex);
  var xy1 = uv1 * 2.0 - 1.0;
  
  // Lerp between fixed size and full perspective.
  var pixelScale = getPerspectiveScale(center.w, depth);

  // Apply half pixel edge bleed on XY and UV
  var xy: vec2<f32>;
  var uv: vec2<f32>;
  if (HAS_EDGE_BLEED) {
    let bleed = 0.5;
    var ul = rectangle.xy * pixelScale - bleed;
    var br = rectangle.zw * pixelScale + bleed;
    var wh = (rectangle.zw - rectangle.xy) * pixelScale;

    xy = mix(ul, br, uv1);
    uv = mix(rectangleUV.xy, rectangleUV.zw, uv1 + xy1 * bleed / wh);
  }
  else {
    xy = mix(rectangle.xy, rectangle.zw, uv1) * pixelScale;
    uv = mix(rectangleUV.xy, rectangleUV.zw, uv1);
  }

  // Attach to position
  var vr = getViewResolution();
  var offset = xy * vr;
  center = vec4<f32>(center.xy + 2.0 * offset * center.w, center.zw);

  if (zBias != 0.0) {
    var size = max(xy.x, xy.y) * vr.y;
    center = applyZBias(center, size * zBias);
  }

  let uv4 = vec4<f32>(uv, 0.0, 0.0);
  let st4 = vec4<f32>(0.0);

  return SolidVertex(
    center,
    color,
    uv4,
    st4,
    instanceIndex,
  );
}