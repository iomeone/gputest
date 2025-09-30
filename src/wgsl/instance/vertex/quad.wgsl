use '../../../wgsl/use/types'::{ SolidVertex, ShadedVertex };
use '../../../wgsl/use/view'::{ getViewResolution, viewToWorld, worldToClip, worldToW, getClipToWorldScale, getScreenScale, getViewNearFar, getViewVector, clipToWorld, to3D, applyZBias };
use '../../../wgsl/geometry/quad'::{ getQuadUV };
use '../../../wgsl/geometry/strip'::{ getStripGridUV };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getScissor(i: u32) -> vec4<f32> { return vec4<f32>(1.0); };

@optional @link fn getRectangle(i: u32) -> vec4<f32> { return vec4<f32>(-1.0, -1.0, 1.0, 1.0); };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };
@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };

@optional @link fn getPointCount() -> f32 { return 1.0; }

@export fn getQuadVertex(vertexIndex: u32, elementIndex: u32) -> SolidVertex {

  let position = getPosition(elementIndex);
  let scissor = getScissor(elementIndex);
  let rectangle = getRectangle(elementIndex);
  let color = getColor(elementIndex);
  let depth = getDepth(elementIndex);
  let rectangleUV = getUV(elementIndex);
  let st4 = getST(elementIndex);
  let zBias = getZBias(elementIndex);

  var center = worldToClip(position);

  let uvQuad = getQuadUV(vertexIndex);

  // Lerp between fixed size and full perspective.
  let pixelScale = getScreenScale(center.w, depth);

  // Get UV for quad corners + edge bleed
  let uvxy = getRectangleUV(uvQuad, rectangle, rectangleUV, pixelScale);
  let uv = uvxy.xy;
  let xy = uvxy.zw;

  // Attach to position
  let vr = getViewResolution();
  let offset = xy * vr;
  center = vec4<f32>(center.xy + 2.0 * offset * center.w, center.zw);

  if (zBias != 0.0) {
    let size = max(abs(xy.x), abs(xy.y));
    center = applyZBias(center, size * zBias);
  }

  let uv4 = vec4<f32>(uv, f32(elementIndex) / getPointCount(), 0.0);

  return SolidVertex(
    center,
    color,
    uv4,
    st4,
    scissor,
    elementIndex,
  );
}

@export fn getQuadVertexShaded(vertexIndex: u32, elementIndex: u32) -> ShadedVertex {

  let position = getPosition(elementIndex);
  let scissor = getScissor(elementIndex);
  let rectangle = getRectangle(elementIndex);
  let color = getColor(elementIndex);
  let depth = getDepth(elementIndex);
  let rectangleUV = getUV(elementIndex);
  let st4 = getST(elementIndex);
  let zBias = getZBias(elementIndex);

  let centerW = worldToW(position);

  let uvQuad = getQuadUV(vertexIndex);

  // Lerp between fixed size and full perspective.
  let pixelScale = getScreenScale(centerW, depth);
  let worldScale = centerW * getClipToWorldScale();

  // Get UV for quad corners + edge bleed
  let uvxy = getRectangleUV(uvQuad, rectangle, rectangleUV, pixelScale);
  let uv = uvxy.xy;
  let xy = uvxy.zw * worldScale;

  // XY size
  let size = max(abs(xy.x), abs(xy.y));

  // Camera-facing sprite (not parallel to Z plane)
  let view = getViewVector(position.xyz);
  let normal = normalize(view);

  // Shift forwards by sprite radius, but clamp to near-plane
  let nearFar = getViewNearFar();
  let near = mix(nearFar.x, nearFar.y, 0.0000001);
  let offset = min(size, length(view) - near);

  let tangentX = normalize(cross(viewToWorld(vec4<f32>(0.0, 1.0, 0.0, 0.0)).xyz, normal));
  let tangentY = -normalize(cross(viewToWorld(vec4<f32>(1.0, 0.0, 0.0, 0.0)).xyz, normal));

  // Attach to position in world space
  let world = vec4<f32>(position.xyz + mat2x3<f32>(tangentX, tangentY) * xy + offset * normal, 1.0);

  // Sphere center + radius
  let worldNormal = vec4<f32>(normal.xyz, 0.0);
  let worldTangent = vec4<f32>(position.xyz, size);

  // ZBias
  var center = worldToClip(world);
  if (zBias != 0.0) {
    center = applyZBias(center, size * zBias);
  }

  let uv4 = vec4<f32>(uv, f32(elementIndex) / getPointCount(), 0.0);

  return ShadedVertex(
    center,
    world,
    worldNormal,
    worldTangent,
    color,
    uv4,
    st4,
    scissor,
    elementIndex,
  );
}

fn getRectangleUV(
  uvQuad: vec2<f32>,
  rectangle: vec4<f32>,
  rectangleUV: vec4<f32>,
  pixelScale: f32,
) -> vec4<f32> {
  var xy: vec2<f32>;
  var uv: vec2<f32>;

  if (HAS_EDGE_BLEED) {
    // Apply half pixel edge bleed on XY and UV
    let bleed = 0.5;
    let ul = rectangle.xy * pixelScale - bleed;
    let br = rectangle.zw * pixelScale + bleed;
    let wh = (rectangle.zw - rectangle.xy) * pixelScale;

    let xyQuad = uvQuad * 2.0 - 1.0;
    let t = uvQuad + xyQuad * bleed / wh;

    xy = mix(ul, br, uvQuad);
    uv = mix(rectangleUV.xy, rectangleUV.zw, t);
  }
  else {
    xy = mix(rectangle.xy, rectangle.zw, uvQuad) * pixelScale;
    uv = mix(rectangleUV.xy, rectangleUV.zw, uvQuad);
  }

  return vec4<f32>(uv, xy);
}
