@link fn getDispatchSize() -> u32;

@link fn getStep() -> u32;

@link fn getTrim(i: u32) -> vec2<u32>;

@link var<storage, read_write> arcLengthBuffer: array<f32>;

@compute @workgroup_size(64)
@export fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let dispatchSize = getDispatchSize();
  if (globalId.x >= dispatchSize) { return; }

  let i = globalId.x;
  
  let start = getTrim(i).x;
  let index = i - start;

  let step = getStep();
  let mask = (index >> step) & 1u;

  if (mask != 0) {
    let base = start + ((index >> (step + 1u)) << (step + 1u));
    let stride = (1u << step) - 1u;

    arcLengthBuffer[i] = arcLengthBuffer[i] + arcLengthBuffer[base + stride];
  }
}
