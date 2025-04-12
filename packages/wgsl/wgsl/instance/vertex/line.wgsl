use '@use-gpu/wgsl/use/types'::{ SolidVertex, ShadedVertex };
use '@use-gpu/wgsl/use/view'::{ worldToClip, worldToView, viewToClip, to3D, clipToWorld, clipLineIntoView, getWorldScale, getScreenScale, applyZBias3, applyZBias };
use '@use-gpu/wgsl/geometry/strip'::{ getStripUV, getTubeUV };
use '@use-gpu/wgsl/geometry/tube'::{ getTubeJoin };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };
use '@use-gpu/wgsl/geometry/arrow'::{ getArrowSize };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getScissor(i: u32) -> vec4<f32> { return vec4<f32>(1.0); };

@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };

@optional @link fn getSegment(i: u32) -> i32 { return 0; };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getWidth(i: u32) -> f32 { return 1.0; };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };

@optional @link fn getTrim(i: u32) -> vec4<u32> { return vec4<u32>(0u, 0u, 0u, 0u); };
@optional @link fn getSize(i: u32) -> f32 { return 3.0; };

@optional @link fn getSegmentCount() -> f32 { return 1.0; }

const ARROW_ASPECT: f32 = 2.5;

@export fn getLineVertex(vertexIndex: u32, elementIndex: u32) -> SolidVertex {
  var segmentLeft = getSegment(elementIndex);
  if (segmentLeft == 0 || segmentLeft == 2) {
    return SolidVertex(
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      0u,
    );
  }

  var uv1 = select(getStripUV(vertexIndex), getTubeUV(vertexIndex, LINE_STRIP_DETAIL), LINE_STRIP_DETAIL > 0);
  var xy = uv1 * 2.0 - 1.0;

  var cornerIndex: u32;
  var joinIndex: u32;
  if (uv1.x == 0.0) {
    joinIndex = u32(LINE_JOIN_SIZE);
    cornerIndex = elementIndex;
  }
  else {
    joinIndex = u32(uv1.x) - 1u;
    cornerIndex = elementIndex + 1u;
  }

  let trimIndex = getTrim(elementIndex);
  var trimMode = i32(trimIndex.z);

  let rectangleUV = getUV(cornerIndex);
  let st4 = getST(cornerIndex);

  let uv = mix(rectangleUV.xy, rectangleUV.zw, uv1);
  let uv4 = vec4<f32>(uv, f32(elementIndex) / getSegmentCount(), 0.0);

  let segment = getSegment(cornerIndex);
  let color = getColor(cornerIndex);
  var width = getWidth(cornerIndex);
  let depth = getDepth(cornerIndex);
  let zBias = getZBias(cornerIndex);

  var centerPos = getPosition(cornerIndex);
  var beforePos = centerPos;
  var afterPos = centerPos;

  let scissor = getScissor(cornerIndex);

  // Load prev/next point unless start/emd
  if (segment != 1) { beforePos = getPosition(cornerIndex - 1u); }
  else { trimMode = trimMode & 1; }
  if (segment != 2) { afterPos = getPosition(cornerIndex + 1u); }
  else { trimMode = trimMode & 2; }

  // Trim from end points
  if (trimMode > 0) {
    var size = getSize(cornerIndex);
    var startIndex = trimIndex.x;
    var endIndex = trimIndex.y;

    centerPos = trimLine(beforePos, centerPos, afterPos, cornerIndex, trimIndex.x, trimIndex.y, trimMode, width, depth, size);
    if (centerPos.w == 0.0) {
      centerPos.w = 1.0;
      width = 0.0;
    }
  }

  // Clip ends into view
  let clipped = clipLine(beforePos, centerPos, afterPos, select(beforePos, afterPos, uv1.x == 0));
  let before = clipped.before;
  let center = clipped.center;
  let after = clipped.after;

  // Lerp between fixed size and full perspective
  let pixelScale = getScreenScale(clipped.w, depth);
  let lineWidth = width * pixelScale;

  let arc = f32(joinIndex) / f32(LINE_JOIN_SIZE);
  var lineJoin = getLineJoin(before, center, after, arc, xy.y, lineWidth, segment, LINE_JOIN_STYLE);

  if (zBias != 0.0) {
    lineJoin = applyZBias3(lineJoin, width * zBias, clipped.w);
  }

  let position = vec4<f32>(lineJoin, 1.0) * clipped.w;

  return SolidVertex(
    position,
    color,
    uv4,
    st4,
    scissor,
    cornerIndex,
  );
}

@export fn getLineShadedVertex(vertexIndex: u32, elementIndex: u32) -> ShadedVertex {
  var segmentLeft = getSegment(elementIndex);
  if (segmentLeft == 0 || segmentLeft == 2) {
    return ShadedVertex(
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      vec4<f32>(0.0),
      0u,
    );
  }

  var uv1 = select(getStripUV(vertexIndex), getTubeUV(vertexIndex, LINE_STRIP_DETAIL), LINE_STRIP_DETAIL > 0);
  var xy = uv1 * 2.0 - 1.0;

  var cornerIndex: u32;
  var joinIndex: u32;
  if (uv1.x == 0.0) {
    joinIndex = u32(LINE_JOIN_SIZE);
    cornerIndex = elementIndex;
  }
  else {
    joinIndex = u32(uv1.x) - 1u;
    cornerIndex = elementIndex + 1u;
  }

  let trimIndex = getTrim(elementIndex);
  var trimMode = i32(trimIndex.z);

  let rectangleUV = getUV(cornerIndex);
  let st4 = getST(cornerIndex);

  let uv = mix(rectangleUV.xy, rectangleUV.zw, uv1);
  let uv4 = vec4<f32>(uv, f32(elementIndex) / getSegmentCount(), 0.0);

  let segment = getSegment(cornerIndex);
  let color = getColor(cornerIndex);
  var width = getWidth(cornerIndex);
  let depth = getDepth(cornerIndex);
  let zBias = getZBias(cornerIndex);

  var centerPos = getPosition(cornerIndex);
  var beforePos = centerPos;
  var afterPos = centerPos;

  let scissor = getScissor(cornerIndex);

  // Load prev/next point unless start/emd
  if (segment != 1) { beforePos = getPosition(cornerIndex - 1u); }
  else { trimMode = trimMode & 1; }
  if (segment != 2) { afterPos = getPosition(cornerIndex + 1u); }
  else { trimMode = trimMode & 2; }

  // Trim from end points
  if (trimMode > 0) {
    var size = getSize(cornerIndex);
    var startIndex = trimIndex.x;
    var endIndex = trimIndex.y;

    centerPos = trimLine(beforePos, centerPos, afterPos, cornerIndex, trimIndex.x, trimIndex.y, trimMode, width, depth, size);
    if (centerPos.w == 0.0) {
      centerPos.w = 1.0;
      width = 0.0;
    }
  }

  let center4 = worldToClip(centerPos);

  // Tube around center (in world space)
  let arc = f32(joinIndex) / f32(LINE_JOIN_SIZE);
  let lineWidth = width * getWorldScale(center4.w, depth) / 2.0;
  let tubeJoin = getTubeJoin(beforePos, centerPos, afterPos, arc, xy.y, lineWidth, segment, LINE_JOIN_STYLE);

  let world = vec4<f32>(tubeJoin.position, 1.0);
  let worldNormal = vec4<f32>(tubeJoin.normal, 1.0);
  let worldTangent = vec4<f32>(0.0);

  var position = worldToClip(world);

  if (zBias != 0.0) {
    position = applyZBias(position, width * zBias);
  }

  return ShadedVertex(
    position,
    world,
    worldNormal,
    worldTangent,
    color,
    uv4,
    st4,
    scissor,
    cornerIndex,
  );
}

struct LineWedge {
  before: vec3<f32>,
  center: vec3<f32>,
  after: vec3<f32>,
  w: f32,
}

fn clipLine(
  beforePos: vec4<f32>,
  centerPos: vec4<f32>,
  afterPos: vec4<f32>,
  refPos: vec4<f32>,
) -> LineWedge {
  // Clip ends into view
  var clipBeforeV = clipLineIntoView(beforePos, centerPos);
  var clipAfterV  = clipLineIntoView(afterPos, centerPos);

  var before4 = viewToClip(clipBeforeV);
  var after4  = viewToClip(clipAfterV);

  var centerV = worldToView(centerPos);
  var center4 = viewToClip(centerV);

  if (center4.w <= 0.0) {
    centerV = clipLineIntoView(centerPos, refPos);
    center4 = viewToClip(centerV);
  }

  return LineWedge(to3D(before4), to3D(center4), to3D(after4), center4.w);
}

fn trimLine(
  beforePos: vec4<f32>,
  centerPos: vec4<f32>,
  afterPos: vec4<f32>,
  centerIndex: u32,
  startIndex: u32,
  endIndex: u32,
  trimMode: i32,
  width: f32,
  depth: f32,
  size: f32,
) -> vec4<f32> {
  var midIndex = (startIndex + endIndex) / 2u;

  var startPos = centerPos;
  var midPos = getPosition(midIndex);
  var endPos = centerPos;

  if (startIndex != centerIndex) { startPos = getPosition(startIndex); }
  if (endIndex != centerIndex) { endPos = getPosition(endIndex); }

  let maxLength = length(endPos.xyz - midPos.xyz) + length(midPos.xyz - startPos.xyz);

  var trimmedPos = centerPos;
  var both = 0;
  if (trimMode == 3) { both = 1; }

  if ((trimMode & 1) != 0) {
    var start = worldToClip(startPos);
    if (start.w > 0.0) {
      var nextPos = getPosition(startIndex + 1u);
      trimmedPos = trimAnchor(maxLength, trimmedPos.w, startPos.xyz, nextPos.xyz, trimmedPos.xyz, afterPos.xyz, width, size, both, start.w, depth);
    }
  }
  if ((trimMode & 2) != 0) {
    var end = worldToClip(endPos);
    if (end.w > 0.0) {
      var nextPos = getPosition(endIndex - 1u);
      trimmedPos = trimAnchor(maxLength, trimmedPos.w, endPos.xyz, nextPos.xyz, trimmedPos.xyz, beforePos.xyz, width, size, both, end.w, depth);
    }
  }

  return trimmedPos;
}

fn trimAnchor(
  maxLength: f32,
  trimmedW: f32,

  anchor: vec3<f32>,
  next: vec3<f32>,
  center: vec3<f32>,
  after: vec3<f32>,
  width: f32,
  size: f32,
  both: i32,
  w: f32,
  depth: f32,
) -> vec4<f32> {
  var tangent = normalize(next - anchor);
  var distanceStart = getAnchorDistance(anchor, tangent, center);
  var distanceEnd = getAnchorDistance(anchor, tangent, after);

  var arrowLength = getArrowSize(maxLength, width, size, both, w, depth) * ARROW_ASPECT;

  if (distanceStart >= 0.0 && distanceStart < arrowLength) {
    let shouldTrim = select(trimmedW, 0.0, distanceEnd >= 0.0 && distanceEnd < arrowLength);
    let ratio = (arrowLength - distanceStart) / (distanceEnd - distanceStart);
    return vec4<f32>(mix(center, after, ratio), shouldTrim);
  }

  return vec4<f32>(center, trimmedW);
}

fn getAnchorDistance(anchor: vec3<f32>, tangent: vec3<f32>, center: vec3<f32>) -> f32 {
  var diff = center - anchor;

  var distance = dot(diff, tangent);
  var align = dot(normalize(diff), tangent);

  if (length(diff) == 0.0) { return 0.0; }
  else if (align > 0.92) { return distance; }
  else { return -1.0; }
}
