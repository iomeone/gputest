use '@use-gpu/wgsl/use/types'::{ ShadedVertex };
use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3 };
use '@use-gpu/wgsl/use/view'::{ getViewResolution, worldToClip, getPerspectiveScale, getViewScale, applyZBias };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadIndex };
use '@use-gpu/wgsl/geometry/normal'::{ getOrthoVector };

@link fn getEdgeId(i: u32) -> u32 { };
@link fn getVertexIndex(i: u32) -> u32 { };
@link fn getVertexPosition(i: u32) -> vec4<f32> { };
@link fn getVertexNormal(i: u32) -> vec4<f32> { };

@optional @link fn transformPosition(p: vec4<f32>, i: u32) -> vec4<f32> { return p; };
@optional @link fn transformDifferential(v: vec4<f32>, b: vec4<f32>, c: bool, i: u32) -> vec4<f32> { return v; };

@link fn getVolumeSize(i: u32) -> vec3<u32> { };
@link fn getPadding(i: u32) -> f32 { return 0u; };

@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };

@optional @link fn getRangeMin(i: u32) -> vec3<f32> { return vec3<f32>(-1.0, -1.0, -1.0); };
@optional @link fn getRangeMax(i: u32) -> vec3<f32> { return vec3<f32>(1.0, 1.0, 1.0); };

fn unpackEdgeId(id: u32) -> vec4<u32> {
  return (vec4<u32>(id) >> vec4<u32>(0u, 9u, 18u, 27u)) & vec4<u32>(0x1FFu);
}

fn inverseMat3x3(m: mat3x3<f32>) -> mat3x3<f32> {

  let a00 = m[0][0];
  let a01 = m[0][1];
  let a02 = m[0][2];
  let a10 = m[1][0];
  let a11 = m[1][1];
  let a12 = m[1][2];
  let a20 = m[2][0];
  let a21 = m[2][1];
  let a22 = m[2][2];

  let b01 = a22 * a11 - a12 * a21;
  let b11 = -a22 * a10 + a12 * a20;
  let b21 = a21 * a10 - a11 * a20;

  let det = a00 * b01 + a01 * b11 + a02 * b21;

  return mat3x3<f32>(vec3<f32>(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11)) / det,
                     vec3<f32>(b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10)) / det,
                     vec3<f32>(b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det);
}

@export fn getDualContourVertex(vertexIndex: u32, instanceIndex: u32) -> ShadedVertex {

  let edgeId = getEdgeId(instanceIndex);
  let edgeIndex = unpackEdgeId(edgeId);

  let gridSize = getVolumeSize(instanceIndex);

  var color = getColor(instanceIndex);
  let zBias = getZBias(instanceIndex);

  let padding = getPadding(instanceIndex);
  let rangeMin = getRangeMin(instanceIndex);
  let rangeMax = getRangeMax(instanceIndex);

  var ij = getQuadIndex(vertexIndex);

  var gridIndex = edgeIndex.xyz;
  let parity = (gridIndex & vec3<u32>(1u));
  var normalIndex: u32 = 0u;

  if (edgeIndex.a == 1u) {
    if ((parity.y ^ parity.z) != 0u) { gridIndex -= vec3<u32>(0u, ij.y, 1u - ij.x); }
    else { gridIndex -= vec3<u32>(0u, ij); }
  }
  else if (edgeIndex.a == 2u) {
    if ((parity.y ^ parity.z) != 0u) { gridIndex -= vec3<u32>(0u, 1u - ij.x, ij.y); }
    else { gridIndex -= vec3<u32>(0u, ij.yx); }
  }
  else if (edgeIndex.a == 3u) {
    normalIndex = 1u;
    if ((parity.x ^ parity.z) != 0u) { gridIndex -= vec3<u32>(1u - ij.x, 0u, ij.y); }
    else { gridIndex -= vec3<u32>(ij.y, 0u, ij.x); }
  }
  else if (edgeIndex.a == 4u) {
    normalIndex = 1u;
    if ((parity.x ^ parity.z) != 0u) { gridIndex -= vec3<u32>(ij.y, 0u, 1u - ij.x); }
    else { gridIndex -= vec3<u32>(ij.x, 0u, ij.y); }
  }
  else if (edgeIndex.a == 5u) {
    normalIndex = 2u;
    if ((parity.x ^ parity.y) != 0u) { gridIndex -= vec3<u32>(ij.y, 1u - ij.x, 0u); }
    else { gridIndex -= vec3<u32>(ij, 0u); }
  }
  else if (edgeIndex.a == 6u) {
    normalIndex = 2u;
    if ((parity.x ^ parity.y) != 0u) { gridIndex -= vec3<u32>(1u - ij.x, ij.y, 0u); }
    else { gridIndex -= vec3<u32>(ij.yx, 0u); }
  }

  let modulus = sizeToModulus3(gridSize);
  let index = getVertexIndex(packIndex3(gridIndex, modulus));

  let vertex = getVertexPosition(index).xyz;
  var normal: vec4<f32>;
  if (IS_QUADRATIC) { normal = getVertexNormal(index * 3 + normalIndex); }
  else { normal = getVertexNormal(index); }

  let uv3 = (vertex - padding) / (vec3<f32>(gridSize - 1u) - padding * 2.0);
  let object = mix(rangeMin, rangeMax, uv3);
  let object4 = vec4<f32>(object, 1.0);

  let world = transformPosition(object4);
  let worldNormal = transformDifferential(normal, object4, true);

  var center = worldToClip(world);
  if (zBias != 0.0) {
    var vr = getViewResolution();
    var size = vr.y;
    center = applyZBias(center, size * zBias);
  }

  let scissor3 = min(uv3, 1.0 - uv3);
  let scissor = vec4<f32>(scissor3, 1.0);

  let tangent4 = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  let uv4 = vec4<f32>(uv3, 0.0);
  let st4 = vec4<f32>(0.0);

  return ShadedVertex(
    center,
    world,
    worldNormal,
    tangent4,
    color,
    uv4,
    st4,
    scissor,
    edgeId,
 );
}