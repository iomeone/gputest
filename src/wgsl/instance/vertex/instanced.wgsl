@infer type T;

@link fn getVertex(vertexIndex: u32, instanceIndex: u32) -> @infer(T) T;
@link fn loadInstance(i: u32) { };

@optional @link fn getMappedInstance(v: u32, i: u32) -> vec2<u32> { return vec2<u32>(i, i); };

@export fn getInstancedVertex(vertexIndex: u32, instanceIndex: u32) -> T {
  var elementIndex: u32;

  if (HAS_INSTANCES) {
    let mappedIndex = getMappedInstance(vertexIndex, instanceIndex);
    elementIndex = mappedIndex.x;

    let uniformIndex = mappedIndex.y;
    loadInstance(uniformIndex);
  }
  else {
    elementIndex = instanceIndex;
  }

  return getVertex(vertexIndex, elementIndex);
};
