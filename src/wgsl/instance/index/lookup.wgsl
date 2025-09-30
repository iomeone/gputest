@link fn getInstanceIndex(i: u32) -> u32 {};

@export fn getInstanceLookupIndex(vertexIndex: u32, instanceIndex: u32) -> vec2<u32> {
  var elementIndex: u32;
  var uniformIndex: u32;

  elementIndex = instanceIndex;
  uniformIndex = getInstanceIndex(instanceIndex);

  return vec2<u32>(elementIndex, uniformIndex);
};