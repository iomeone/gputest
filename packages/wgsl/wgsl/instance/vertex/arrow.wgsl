use '@use-gpu/wgsl/use/types'::{ SolidVertex, ShadedVertex };
use '@use-gpu/wgsl/use/view'::{ getViewVector, worldToClip, worldToView, viewToClip, worldToClip3D, applyZBias, getViewPosition };
use '@use-gpu/wgsl/geometry/arrow'::{ getArrowSize, getArrowCorrection };

@optional @link fn getVertex(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getNormal(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };

@optional @link fn getAnchor(i: u32) -> vec4<u32> { return vec4<u32>(0u, 1u, 0u, 0u); };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); };
@optional @link fn getScissor(i: u32) -> vec4<f32> { return vec4<f32>(1.0); };

@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };

@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getSize(i: u32) -> f32 { return 3.0; };
@optional @link fn getWidth(i: u32) -> f32 { return 1.0; };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };

@optional @link fn getSegmentCount() -> f32 { return 1.0; }

const ARROW_ASPECT: f32 = 2.5;

@export fn getArrowVertex(vertexIndex: u32, elementIndex: u32) -> SolidVertex {
  let meshPosition = getVertex(vertexIndex);

  let anchor = getAnchor(elementIndex);
  let anchorIndex = anchor.x;
  let nextIndex = anchor.y;
  let endIndex = anchor.z;
  let both = i32(anchor.w);

  let color = getColor(anchorIndex);
  let size = getSize(anchorIndex);
  let width = getWidth(anchorIndex);
  let depth = getDepth(anchorIndex);
  let zBias = getZBias(anchorIndex);

  let scissor = getScissor(anchorIndex);

  let startPos = getPosition(anchorIndex);
  let nextPos = getPosition(nextIndex);
  let midPos = getPosition((anchorIndex + endIndex) / 2u);
  let endPos = getPosition(endIndex);

  let anchorFrame = getAnchorFrame(startPos, nextPos, midPos, endPos, depth, width, size, both);

  let uv4 = getAnchorUV(anchorIndex, nextIndex);
  let st4 = getST(anchorIndex);

  let orientedPos = anchorFrame.matrix * vec4<f32>(vec3<f32>(meshPosition.x, meshPosition.yz * anchorFrame.radius) * anchorFrame.size, 1.0);

  let finalPos = vec4<f32>(orientedPos.xyz + startPos.xyz, 1.0);
  var position = worldToClip(finalPos);

  if (zBias != 0.0) {
    position = applyZBias(position, width * zBias);
  }

  return SolidVertex(
    position,
    color,
    uv4,
    st4,
    scissor,
    anchorIndex,
  );
}

@export fn getArrowVertexShaded(vertexIndex: u32, elementIndex: u32) -> ShadedVertex {
  let meshPosition = getVertex(vertexIndex);
  let meshNormal = getNormal(vertexIndex);

  let anchor = getAnchor(elementIndex);
  let anchorIndex = anchor.x;
  let nextIndex = anchor.y;
  let endIndex = anchor.z;
  let both = i32(anchor.w);

  let color = getColor(anchorIndex);
  let size = getSize(anchorIndex);
  let width = getWidth(anchorIndex);
  let depth = getDepth(anchorIndex);
  let zBias = getZBias(anchorIndex);

  let scissor = getScissor(anchorIndex);

  let startPos = getPosition(anchorIndex);
  let nextPos = getPosition(nextIndex);
  let midPos = getPosition((anchorIndex + endIndex) / 2u);
  let endPos = getPosition(endIndex);

  let anchorFrame = getAnchorFrame(startPos, nextPos, midPos, endPos, depth, width, size, both);

  let uv4 = getAnchorUV(anchorIndex, nextIndex);
  let st4 = getST(anchorIndex);

  let orientedPos = anchorFrame.matrix * vec4<f32>(vec3<f32>(meshPosition.x, meshPosition.yz * anchorFrame.radius) * anchorFrame.size, 1.0);
  let orientedNormal = anchorFrame.matrix * vec4<f32>(meshNormal.xyz, 1.0);
  let orientedTangent = vec4<f32>(0.0);

  let finalPos = vec4<f32>(orientedPos.xyz + startPos.xyz, 1.0);
  var position = worldToClip(finalPos);

  if (zBias != 0.0) {
    position = applyZBias(position, width * zBias);
  }

  return ShadedVertex(
    position,
    finalPos,
    orientedNormal,
    orientedTangent,
    color,
    uv4,
    st4,
    scissor,
    anchorIndex,
  );
}

struct AnchorFrame {
  matrix: mat4x4<f32>,
  size: f32,
  radius: f32,
};

fn getAnchorFrame(
  startPos: vec4<f32>,
  nextPos: vec4<f32>,
  midPos: vec4<f32>,
  endPos: vec4<f32>,
  depth: f32,
  width: f32,
  size: f32,
  both: i32,
) -> AnchorFrame {
  let center = worldToClip(startPos);

  let maxLength = length(endPos.xyz - midPos.xyz) + length(midPos.xyz - startPos.xyz);
  let arrowSize = getArrowSize(maxLength, width, size, both, center.w, depth);

  let t = normalize(nextPos.xyz - startPos.xyz);
  let u = select(vec3<f32>(1.0, 0.0, 0.0), vec3<f32>(0.0, 0.0, 1.0), abs(t.z) < 0.5);
  let n = normalize(cross(t, u));
  let b = cross(t, n);

  let m = mat4x4<f32>(
    vec4<f32>(t.xyz, 0.0),
    vec4<f32>(b.xyz, 0.0),
    vec4<f32>(n.xyz, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0),
  );

  let offset = vec4<f32>(t.xyz, 0.0) * (ARROW_ASPECT * arrowSize);
  let cap = worldToClip(startPos + offset);

  var arrowRadius = 1.0;
  if (cap.w > 0.0 && center.w > 0.0) {
    arrowRadius = getArrowCorrection(cap.w, center.w, depth);
  }

  return AnchorFrame(m, arrowSize, arrowRadius);
}

fn getAnchorUV(anchorIndex: u32, nextIndex: u32) -> vec4<f32> {
  let rectangleUV = getUV(anchorIndex);
  let uv = mix(rectangleUV.xy, rectangleUV.zw, select(1.0, 0.0, nextIndex > anchorIndex));
  return vec4<f32>(uv, f32(anchorIndex) / getSegmentCount(), 0.0);
}

