@link var<storage, read_write> counter: atomic<u32>;
@link var<storage, read_write> positions: array<vec4<f32>>;
@link var<storage, read_write> colors: array<vec4<f32>>;
@link var<storage, read_write> segments: array<i32>;

@export fn emitPoint(p: vec3<f32>, c: vec3<f32>) {
  let index = atomicAdd(&counter, 1u);
  positions[index] = vec4<f32>(p, 1.0);
  colors[index] = vec4<f32>(c, 1.0);
  segments[index] = 0;
}

@export fn emitLine(a: vec3<f32>, b: vec3<f32>, c: vec3<f32>) {
  let index = atomicAdd(&counter, 2u);
  positions[index] = vec4<f32>(a, 1.0);
  positions[index + 1] = vec4<f32>(b, 1.0);
  colors[index] = vec4<f32>(c, 1.0);
  colors[index + 1] = vec4<f32>(c, 1.0);
  segments[index] = 1;
  segments[index + 1] = 2;
}