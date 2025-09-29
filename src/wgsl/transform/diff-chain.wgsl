@link fn transformPositionA(origin: vec4<f32>) -> vec4<f32>;

@link fn getDifferentialA(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32>;
@link fn getDifferentialB(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32>;

@export fn getChainDifferential(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32> {
  let v = getDifferentialA(vector, origin, contravariant);
  return getDifferentialB(v, transformPositionA(origin), contravariant);
}
