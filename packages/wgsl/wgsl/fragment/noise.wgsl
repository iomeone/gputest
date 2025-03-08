@export fn IGN(xy: vec2<u32>, frame: u32) -> f32 {
  let uv = vec2<f32>(xy) + 5.588238 * f32(frame % 64);
  let f = dot(vec2<f32>(0.06711056, 0.00583715), uv) % 1.0;
  return (52.9829189 * f) % 1.0;
};
