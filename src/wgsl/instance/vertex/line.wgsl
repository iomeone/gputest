use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/use/view'::{ viewUniforms, worldToClip, worldToView, viewToClip, toClip3D, clipLineIntoView, getPerspectiveScale };
use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };
use '@use-gpu/wgsl/geometry/arrow'::{ getArrowSize };

@optional @external fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @external fn getSegment(i: u32) -> i32 { return 0; };
@optional @external fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @external fn getWidth(i: u32) -> f32 { return 1.0; };
@optional @external fn getDepth(i: u32) -> f32 { return 0.0; };
  
@optional @external fn getTrim(i: u32) -> vec4<u32> { return vec4<u32>(0u, 0u, 0u, 0u); };
@optional @external fn getSize(i: u32) -> f32 { return 3.0; };

let ARROW_ASPECT: f32 = 2.5;

fn getAnchorDistance(anchor: vec3<f32>, tangent: vec3<f32>, center: vec3<f32>) -> f32 {
  var diff = center - anchor;

  var distance = dot(diff, tangent);
  var align = dot(normalize(diff), tangent);

  if (length(diff) == 0.0) { return 0.0; }
  else if (align > 0.92) { return distance; }
  else { return -1.0; }
}

fn trimAnchor(
  maxLength: f32,
  anchor: vec3<f32>,
  next: vec3<f32>,
  center: vec3<f32>,
  after: vec3<f32>,
  width: f32,
  size: f32,
  both: i32,
  w: f32,
  depth: f32,
) -> vec3<f32> {
  var NaN: f32 = bitcast<f32>(0xffffffffu);

  var tangent = normalize(next - anchor);
  var distanceStart = getAnchorDistance(anchor, tangent, center);
  var distanceEnd = getAnchorDistance(anchor, tangent, after);

  var arrowLength = getArrowSize(maxLength, width, size, both, w, depth) * ARROW_ASPECT;

  if (distanceStart >= 0.0 && distanceStart < arrowLength) {
    if (distanceEnd >= 0.0 && distanceEnd < arrowLength) {
      return vec3<f32>(NaN, NaN, NaN);
    }
    else {
      let ratio = (arrowLength - distanceStart) / (distanceEnd - distanceStart);
      return mix(center, after, ratio);
    }
  }

  return center;
}

@export fn getLineVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {
  var NaN: f32 = bitcast<f32>(0xffffffffu);

  var ij = getStripIndex(vertexIndex);

  var segmentLeft = getSegment(instanceIndex);
  if (segmentLeft == 0 || segmentLeft == 2) {
    return SolidVertex(
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec2(NaN, NaN),
      0u,
    );
  }

  var uv = vec2<f32>(ij);
  var xy = uv * 2.0 - 1.0;

  var cornerIndex: u32;
  var joinIndex: u32;
  if (ij.x == 0u) {
    joinIndex = u32(LINE_JOIN_SIZE);
    cornerIndex = instanceIndex;
  }
  else {
    joinIndex = ij.x - 1u;
    cornerIndex = instanceIndex + 1u;
  }

  var trim = getTrim(instanceIndex);
  var trimMode = i32(trim.z);

  var segment = getSegment(cornerIndex);
  var color = getColor(cornerIndex);
  var width = getWidth(cornerIndex);
  var depth = getDepth(cornerIndex);

  var centerPos = getPosition(cornerIndex);
  var beforePos = centerPos;
  var afterPos = centerPos;

  if (segment != 1) { beforePos = getPosition(cornerIndex - 1u); }
  else { trimMode = trimMode & 1; }
  if (segment != 2) { afterPos = getPosition(cornerIndex + 1u); }
  else { trimMode = trimMode & 2; }

  // Trim from end points
  if (trimMode > 0) {
    var size = getSize(cornerIndex);

    var startIndex = trim.x;
    var endIndex = trim.y;
    var midIndex = (startIndex + endIndex) / 2u;

    var startPos = getPosition(startIndex);
    var midPos = getPosition(midIndex);
    var endPos = getPosition(endIndex);

    let maxLength = length(endPos.xyz - midPos.xyz) + length(midPos.xyz - startPos.xyz);

    var both = 0;
    if (trimMode == 3) { both = 1; }

    if ((trimMode & 1) != 0) {
      var start = worldToClip(startPos);
      if (start.w > 0.0) {
        var nextPos = getPosition(trim.x + 1u);
        var trimmed = trimAnchor(maxLength, startPos.xyz, nextPos.xyz, centerPos.xyz, afterPos.xyz, width, size, both, start.w, depth);
        centerPos = vec4<f32>(trimmed, 1.0);
      }
    }
    if ((trimMode & 2) != 0) {
      var end = worldToClip(endPos);
      if (end.w > 0.0) {
        var nextPos = getPosition(trim.y - 1u);
        var trimmed = trimAnchor(maxLength, endPos.xyz, nextPos.xyz, centerPos.xyz, beforePos.xyz, width, size, both, end.w, depth);
        centerPos = vec4<f32>(trimmed, 1.0);
      }
    }
  }

  // Clip ends into view
  var near = viewUniforms.viewNearFar.x * 2.0;
  var clipBeforeV = clipLineIntoView(beforePos, centerPos, near);
  var clipAfterV  = clipLineIntoView(afterPos, centerPos, near);

  var before = toClip3D(viewToClip(clipBeforeV));
  var after  = toClip3D(viewToClip(clipAfterV));

  var centerV = worldToView(centerPos);
  var center4 = viewToClip(centerV);

  if (center4.w <= 0.0) {
    if (ij.x == 0u) {
      centerV = clipLineIntoView(centerPos, afterPos, near);
    }
    else if (ij.x != 0u) {
      centerV = clipLineIntoView(centerPos, beforePos, near);
    }
    else {
      return SolidVertex(
        vec4(NaN, NaN, NaN, NaN),
        vec4(NaN, NaN, NaN, NaN),
        vec2(NaN, NaN),
        instanceIndex,
      );
    }
    center4 = viewToClip(centerV);
  }

  var center = toClip3D(center4);

  // Lerp between fixed size and full perspective
  var pixelScale = getPerspectiveScale(center4.w, depth);
  width = width * pixelScale;

  var arc = f32(joinIndex) / f32(LINE_JOIN_SIZE);
  var lineJoin = getLineJoin(before, center, after, arc, xy.y, width, segment, LINE_JOIN_STYLE);

  return SolidVertex(
    vec4<f32>(lineJoin, 1.0),
    color,
    uv,
    instanceIndex,
  );
}
