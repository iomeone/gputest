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
@optional @link fn getSegment(i: u32) -> i32 { return -1; };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };

@optional @link fn getIndex(i: u32) -> u32 { return 0u; };

@optional @link fn getInstance(i: u32) -> u32 { return 0u; };
@optional @link fn getInstanceSize() -> u32 { return 0u; };
@optional @link fn loadInstance(i: u32) { };

@export fn getFaceVertex(vertexIndex: u32, globalInstanceIndex: u32) -> ShadedVertex {
  var resolvedIndex: u32;
  var instanceIndex: u32;
  if (HAS_INSTANCES) {
    let size = getInstanceSize();
    resolvedIndex = getInstance(globalInstanceIndex / size);
    instanceIndex = globalInstanceIndex % size;

    loadInstance(resolvedIndex);
  }
  else {
    instanceIndex = globalInstanceIndex;
  }

  let segment = getSegment(instanceIndex);
  let index = instanceIndex * 3u + vertexIndex;

  var cornerIndex: u32;
  var unweldedIndex: u32;
  if (HAS_INDICES && !HAS_SEGMENTS) {
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
    if (vertexIndex == 0u) { cornerIndex = instanceIndex - u32(segment - 1); }
    else if (vertexIndex == 1u) { cornerIndex = instanceIndex + 1u; }
    else { cornerIndex = instanceIndex + 2u; }

    unweldedIndex = cornerIndex;
    if (HAS_INDICES) { cornerIndex = getIndex(cornerIndex); }
  }

  var normalIndex = cornerIndex;
  var tangentIndex = cornerIndex;
  var uvIndex = cornerIndex;
  var lookupIndex = cornerIndex;

  if (UNWELDED_NORMALS) { normalIndex = unweldedIndex; }
  if (UNWELDED_TANGENTS) { tangentIndex = unweldedIndex; }
  if (UNWELDED_UVS) { uvIndex = unweldedIndex; }
  if (UNWELDED_LOOKUPS) { lookupIndex = unweldedIndex; }

  let vertex = getPosition(cornerIndex);
  let normal = getNormal(normalIndex);
  let tangent = getTangent(tangentIndex);
  let uv = getUV(uvIndex);
  let st = getST(uvIndex);

  let color = getColor(cornerIndex);
  let zBias = getZBias(cornerIndex);

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
