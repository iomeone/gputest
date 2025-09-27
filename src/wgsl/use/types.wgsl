@export struct PickVertex {
  position: vec4<f32>,
  index: u32,
};

@export struct SolidVertex {
  position: vec4<f32>,
  color: vec4<f32>,
  uv: vec2<f32>,
  index: u32,
};

@export struct UIVertex {
  position: vec4<f32>,

  uv: vec2<f32>,
  sdfConfig: vec4<f32>,
  sdfUV: vec2<f32>,
  textureUV: vec2<f32>,
  repeat: i32,

  mode: i32,
  layout: vec4<f32>,
  radius: vec4<f32>,
  border: vec4<f32>,
  stroke: vec4<f32>,
  fill: vec4<f32>,

  index: u32,
};

@export struct MeshVertex {
  position: vec4<f32>,
  normal: vec3<f32>,
  color: vec4<f32>,
  uv: vec2<f32>,
};
