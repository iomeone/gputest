@export struct SolidVertex {
  position: vec4<f32>;
  color: vec4<f32>;
  uv: vec2<f32>;
};

@export struct MeshVertex {
  position: vec4<f32>;
  normal: vec3<f32>;
  color: vec4<f32>;
  uv: vec2<f32>;
};
