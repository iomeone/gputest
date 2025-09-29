use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3 };
use './types'::{ IndirectDrawMetaAtomic };

@link var<storage, read_write> indirectDraw: IndirectDrawMetaAtomic;
@link var<storage, read_write> activeEdges: array<u32>;
@link var<storage, read_write> activeCells: array<u32>;
@link var<storage, read_write> markedCells: array<atomic<u32>>;
@link var<storage, read_write> vertexIndices: array<u32>;

@link fn getValueData(i: u32) -> f32 {};
@link fn getVolumeSize() -> vec3<u32> {};
@optional @link fn getVolumeLevel() -> f32 { return 0.0; };

// Append any X/Y/Z edge that crosses the level set
fn appendEdge(id: u32) {
  let nextEdge = atomicAdd(&indirectDraw.instanceCount, 1u);
  activeEdges[nextEdge] = id;
}

// Append a vertex that parallels an active edge
fn appendVertex(i: u32) {
  let g = indirectDraw.generationIndex;

  // Check if vertex was already assigned by a neighbor
  let lastGeneration = atomicMax(&markedCells[i], g);
  if (lastGeneration != g) {

    // Assign to next free index
    let nextCell = atomicAdd(&indirectDraw.nextVertexIndex, 1u);
    activeCells[nextCell] = i;
    vertexIndices[i] = nextCell;

    // Store dispatch count for next pass
    let dispatchCount = (nextCell / 64u) + 1u;
    atomicMax(&indirectDraw.dispatchCount, dispatchCount);
  }
}

// Pack edge ID into 32-bit uint
fn packEdgeId(index: vec3<u32>, axis: u32) -> u32 {
  let shifted = vec4<u32>(index, axis) << vec4<u32>(0u, 9u, 18u, 27u);
  return shifted.x | shifted.y | shifted.z | shifted.w;
}

@compute @workgroup_size(4, 4, 4)
@export fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getVolumeSize();
  if (any(globalId >= (size - 1u))) { return; }

  let level = getVolumeLevel();
  let modulus = sizeToModulus3(size);

  let base = packIndex3(globalId, modulus);

  let p  = getValueData(base) - level;
  let px = getValueData(base + packIndex3(vec3<u32>(1u, 0u, 0u), modulus)) - level;
  let py = getValueData(base + packIndex3(vec3<u32>(0u, 1u, 0u), modulus)) - level;
  let pz = getValueData(base + packIndex3(vec3<u32>(0u, 0u, 1u), modulus)) - level;

  let check = globalId.yzx * globalId.zxy;
  if (check.x > 0u) {
    if (px * p < 0.0) {
      var axis = 1u;
      if (px < p) { axis = 2u; }
      appendEdge(packEdgeId(globalId, axis));

      appendVertex(base - packIndex3(vec3<u32>(0u, 1u, 1u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(0u, 1u, 0u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(0u, 0u, 1u), modulus));
      appendVertex(base);
    }
  }
  if (check.y > 0u) {
    if (py * p < 0.0) {
      var axis = 3u;
      if (py < p) { axis = 4u; }
      appendEdge(packEdgeId(globalId, axis));

      appendVertex(base - packIndex3(vec3<u32>(1u, 0u, 1u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(1u, 0u, 0u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(0u, 0u, 1u), modulus));
      appendVertex(base);
    }
  }
  if (check.z > 0u) {
    if (pz * p < 0.0) {
      var axis = 5u;
      if (pz < p) { axis = 6u; }
      appendEdge(packEdgeId(globalId, axis));

      appendVertex(base - packIndex3(vec3<u32>(1u, 1u, 0u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(1u, 0u, 0u), modulus));
      appendVertex(base - packIndex3(vec3<u32>(0u, 1u, 0u), modulus));
      appendVertex(base);
    }
  }
}
