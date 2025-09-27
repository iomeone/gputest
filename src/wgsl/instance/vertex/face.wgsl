use '@use-gpu/wgsl/use/types'::{ ShadedVertex };
use '@use-gpu/wgsl/use/view'::{ worldToClip, getViewPosition };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getNormal(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };
@optional @link fn getTangent(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 0.0, 0.0, 1.0); };
@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.0, 0.0); };
@optional @link fn getSegment(i: u32) -> i32 { return -1; };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };

@optional @link fn getIndex(i: u32) -> u32 { return 0u; };
@optional @link fn getLookup(i: u32) -> u32 { return i; };

@export fn getFaceVertex(vertexIndex: u32, instanceIndex: u32) -> ShadedVertex {
  let NaN: f32 = bitcast<f32>(0xffffffffu);

  let segment = getSegment(instanceIndex);
  let index = instanceIndex * 3u + vertexIndex;
  
  var cornerIndex: u32;
  var unweldedIndex: u32;
  if (HAS_INDICES) {
    // Indexed geometry
    cornerIndex = getIndex(index);
    unweldedIndex = index;
  }
  else if (segment == -1) {
    // Loose triangles
    cornerIndex = index;
    unweldedIndex = index;
  }
  else if (segment == 0) {
    // Spacer null triangle
    return ShadedVertex(
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      vec4(NaN, NaN, NaN, NaN),
      0u,
    );
  }
  else {
    // Triangle fan
    if (vertexIndex == 0u) { cornerIndex = instanceIndex - u32(segment - 1); }
    else if (vertexIndex == 1u) { cornerIndex = instanceIndex + 1u; }
    else { cornerIndex = instanceIndex + 2u; }
    unweldedIndex = cornerIndex;
  }

  var normalIndex = cornerIndex;
  var tangentIndex = cornerIndex;
  if (UNWELDED_NORMALS) { normalIndex = unweldedIndex; }
  if (UNWELDED_TANGENTS) { tangentIndex = unweldedIndex; }

  var color = getColor(cornerIndex);
  var world = getPosition(cornerIndex);
  var normal = getNormal(normalIndex);
  var tangent = getTangent(tangentIndex);
  var uv = getUV(cornerIndex);
  var st = getST(cornerIndex);

  var position = worldToClip(world);

  return ShadedVertex(
    position,
    world,
    normal,
    tangent,
    color,
    uv,
    st,
    getLookup(cornerIndex),
  );
}
