use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/use/view'::{ worldToClip, worldToClip3D, getPerspectiveScale };
use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/geometry/line'::{ getLineJoin };

@external fn getPosition(i: i32) -> vec4<f32> {};
@external fn getSegment(i: i32) -> i32 {};
@external fn getColor(i: i32) -> vec4<f32> {};
@external fn getSize(i: i32) -> f32 {};
@external fn getDepth(i: i32) -> f32 {};

@export fn getLineVertex(vertexIndex: i32, instanceIndex: i32) -> SolidVertex {
  var NaN: f32 = bitcast<f32>(0xffffffffu);

  var ij = getStripIndex(vertexIndex);

  var segmentLeft = getSegment(instanceIndex);
  if (segmentLeft == 0 || segmentLeft == 2) {
    return SolidVertex(
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec2(NaN, NaN)
    );
  }

  var uv = vec2<f32>(ij);
  var xy = uv * 2.0 - 1.0;

  var cornerIndex: i32;
  var joinIndex: i32;
  if (ij.x == 0) {
    joinIndex = LINE_JOIN_SIZE;
    cornerIndex = instanceIndex;
  }
  else {
    joinIndex = ij.x - 1;
    cornerIndex = instanceIndex + 1;
  }

  var segment = getSegment(cornerIndex);
  var color = getColor(cornerIndex);
  var size = getSize(cornerIndex);
  var depth = getDepth(cornerIndex);

  var beforePos = getPosition(cornerIndex - 1);
  var centerPos = getPosition(cornerIndex);
  var afterPos = getPosition(cornerIndex + 1);

  var before = worldToClip3D(beforePos);
  var center = worldToClip(centerPos);
  var after = worldToClip3D(afterPos);

  // Lerp between fixed size and full perspective
  var pixelScale = getPerspectiveScale(center.w, depth);
  // TODO: awaiting compound support
  // size *= pixelScale;
  size = size * pixelScale;

  var arc = f32(joinIndex) / f32(LINE_JOIN_SIZE);
  var lineJoin = getLineJoin(before, center.xyz / center.w, after, arc, xy.y, size, segment, LINE_JOIN_STYLE);

  return SolidVertex(
    vec4<f32>(lineJoin, 1.0),
    color,
    uv
  );
}
