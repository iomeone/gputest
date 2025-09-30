use '@use-gpu/wgsl/debug/print'::{ PrintData };

@link var<storage, read_write> data: PrintData;
@link var<storage, read_write> positions: array<vec4<f32>>;
@link var<storage, read_write> colors: array<vec4<f32>>;
@link var<storage, read_write> segments: array<i32>;

@export fn printPoint(position: vec4<f32>, color: vec4<f32>) {
  let index = atomicAdd(&data.vertex, 1u);
  positions[index] = position;
  colors[index] = color;
  segments[index] = 0;
}

@export fn printLine(start: vec4<f32>, end: vec4<f32>, color: vec4<f32>) {
  let index = atomicAdd(&data.vertex, 2u);
  positions[index] = start;
  positions[index + 1] = end;
  colors[index] = color;
  colors[index + 1] = color;
  segments[index] = 1;
  segments[index + 1] = 2;
}

@export fn printData(vector: vec4<f32>) {
  let index = atomicAdd(&data.vector, 1u);
  data.vectors[index] = vector;
}
