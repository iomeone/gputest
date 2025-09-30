@link fn getInstanceSize() -> u32 {};

@export fn getInstanceRepeatIndex(vertexIndex: u32, instanceIndex: u32) -> vec2<u32> {
  var elementIndex: u32;
  var uniformIndex: u32;

  let size = getInstanceSize();
  elementIndex = instanceIndex % size;
  uniformIndex = instanceIndex / size;

  return vec2<u32>(elementIndex, uniformIndex);
};