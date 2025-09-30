use '@use-gpu/wgsl/use/types'::{ ShadedVertex };
use '@use-gpu/wgsl/use/view'::{ worldToClip, getViewResolution, applyZBias };

@optional @link fn transformPosition(p: vec4<f32>) -> vec4<f32> { return p; };
@optional @link fn transformDifferential(v: vec4<f32>, b: vec4<f32>, c: bool) -> vec4<f32> { return v; };
@optional @link fn getScissor(pos: vec4<f32>) -> vec4<f32> { return vec4<f32>(1.0); };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getNormal(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };
@optional @link fn getTangent(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 0.0, 0.0, 1.0); };
@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getSegment(i: u32) -> i32 { return 0; };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };

@optional @link fn getIndex(i: u32) -> u32 { return i; };

@export fn getFaceVertex(vertexIndex: u32, elementIndex: u32) -> ShadedVertex {
  let segment = getSegment(elementIndex);
  let index = elementIndex * 3u + vertexIndex;

  var cornerIndex: u32;
  var unweldedIndex: u32;

  var beforeIndex: u32;
  var afterIndex: u32;

  if (HAS_INDICES && !HAS_SEGMENTS) {
    // Indexed geometry
    cornerIndex = getIndex(index);
    unweldedIndex = index;

    if (FLAT_NORMALS) {
      beforeIndex = getIndex(select(index + 2, index - 1, vertexIndex > 0));
      afterIndex = getIndex(select(index - 2, index + 1, vertexIndex < 2));
    }
  }
  else if (!HAS_SEGMENTS) {
    // Loose triangles
    cornerIndex = index;
    unweldedIndex = index;

    if (FLAT_NORMALS) {
      beforeIndex = select(index + 2, index - 1, vertexIndex > 0);
      afterIndex = select(index - 2, index + 1, vertexIndex < 2);
    }
  }
  else if (segment == 0) {
    // Spacer null triangle
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
  else {
    // Triangle fan
    if (vertexIndex == 0u) {
      cornerIndex = elementIndex - u32(segment - 1);
      if (FLAT_NORMALS) {
        beforeIndex = elementIndex + 2u;
        afterIndex = elementIndex + 1u;
      }
    }
    else if (vertexIndex == 1u) {
      cornerIndex = elementIndex + 1u;
      if (FLAT_NORMALS) {
        beforeIndex = elementIndex - u32(segment - 1);
        afterIndex = elementIndex + 2u;
      }
    }
    else {
      cornerIndex = elementIndex + 2u;
      if (FLAT_NORMALS) {
        beforeIndex = elementIndex + 1u;
        afterIndex = elementIndex - u32(segment - 1);
      }
    }

    unweldedIndex = cornerIndex;
    if (HAS_INDICES) {
      cornerIndex = getIndex(cornerIndex);
      if (FLAT_NORMALS) {
        beforeIndex = getIndex(beforeIndex);
        afterIndex = getIndex(afterIndex);
      }
    }
  }

  var colorIndex = cornerIndex;
  var normalIndex = cornerIndex;
  var tangentIndex = cornerIndex;
  var uvIndex = cornerIndex;
  var lookupIndex = cornerIndex;

  if (UNWELDED_COLORS) { colorIndex = unweldedIndex; }
  if (UNWELDED_NORMALS) { normalIndex = unweldedIndex; }
  if (UNWELDED_TANGENTS) { tangentIndex = unweldedIndex; }
  if (UNWELDED_UVS) { uvIndex = unweldedIndex; }
  if (UNWELDED_LOOKUPS) { lookupIndex = unweldedIndex; }

  let vertex = getPosition(cornerIndex);
  let tangent = getTangent(tangentIndex);
  let uv = getUV(uvIndex);
  let st = getST(uvIndex);
  let color = getColor(colorIndex);
  let zBias = getZBias(cornerIndex);

  var normal: vec4<f32>;
  if (FLAT_NORMALS) {
    let b = getPosition(beforeIndex).xyz;
    let a = getPosition(afterIndex).xyz;
    normal = vec4<f32>(normalize(cross(vertex.xyz - a, vertex.xyz - b)), 1.0);
  }
  else {
    normal = getNormal(normalIndex);
  }

  let scissor = getScissor(vertex);

  let world = transformPosition(vertex);
  var worldNormal = transformDifferential(normal, vertex, true);
  let worldTangent = transformDifferential(tangent, vertex, false);

  worldNormal = vec4<f32>(normalize(worldNormal.xyz), worldNormal.w);

  var position = worldToClip(world);

  if (zBias != 0.0) {
    var vr = getViewResolution();
    position = applyZBias(position, vr.y * zBias);
  }

  return ShadedVertex(
    position,
    world,
    worldNormal,
    worldTangent,
    color,
    uv,
    st,
    scissor,
    lookupIndex,
  );
}
