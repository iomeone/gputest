@link fn getDispatchSize() -> u32;

@link fn getPosition(i: u32) -> vec4<f32>;
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
  let i1 = select(i, i - 1, i > start);

  let a = getPosition(i);
  let b = getPosition(i1);

  arcLengthBuffer[i] = length(b - a);
}
