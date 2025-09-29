@export struct IndirectDrawMetaAtomic {
  // Build indirect draw call
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance: u32,

  // Vertex dispatch state
  dispatchCount: atomic<u32>,
  _unused1: u32,
  _unused2: u32,
  generationIndex: u32,

  nextVertexIndex: atomic<u32>,
};

@export struct IndirectDrawMeta {
  // Build indirect draw call
  vertexCount: u32,
  instanceCount: u32,
  firstVertex: u32,
  firstInstance: u32,

  // Vertex dispatch state
  dispatchCount: u32,
  _unused1: u32,
  _unused2: u32,
  generationIndex: u32,

  nextVertexIndex: u32,
};
