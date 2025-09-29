@link var<storage, read>       sourceCommand: array<u32>;
@link var<storage, read_write> destinationCommand: array<u32>;

@compute @workgroup_size(1)
fn main() {
  let vertexCount = sourceCommand[0];
  let instanceCount = sourceCommand[1];

  if (isTriangleStrip) {
    let edges = (vertexCount - 2) * 2 + 1;
    destinationCommand[0] = 4;
    destinationCommand[1] = edges * instanceCount;
    destinationCommand[64] = edges;
  }
  else {
    destinationCommand[0] = 18;
    destinationCommand[1] = vertexCount * instanceCount;
    destinationCommand[64] = vertexCount;
  }
}
