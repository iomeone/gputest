@export struct Light {
  into: mat4x4<f32>,

  position: vec4<f32>,
  normal: vec4<f32>,
  color: vec4<f32>,
  opts: vec4<f32>,

  intensity: f32,
  cutoff: f32,
  kind: i32,

  shadowMap: i32,
  shadowBlur: i32,
  shadowDepth: vec2<f32>,
  shadowBias: vec4<f32>,
  shadowUV: vec4<f32>,
};


@export struct PickVertex {
  position: vec4<f32>,
  scissor: vec4<f32>,
  index: u32,
};

@export struct LightVertex {
  position: vec4<f32>,
  index: u32,
};

@export struct SolidVertex {
  position: vec4<f32>,
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  scissor: vec4<f32>,
  index: u32,
};

@export struct ShadedVertex {
  position: vec4<f32>,
  world: vec4<f32>,
  normal: vec4<f32>,
  tangent: vec4<f32>,
  color: vec4<f32>,
  uv: vec4<f32>,
  st: vec4<f32>,
  scissor: vec4<f32>,
  index: u32,
};

@export struct UIVertex {
  position: vec4<f32>,

  uv: vec2<f32>,
  sdfConfig: vec4<f32>,
  sdfUV: vec2<f32>,
  clipUV: vec4<f32>,
  textureUV: vec2<f32>,
  textureST: vec2<f32>,
  repeat: i32,

  mode: i32,
  shape: vec4<f32>,
  radius: vec4<f32>,
  border: vec4<f32>,
  stroke: vec4<f32>,
  fill: vec4<f32>,
  index: u32,
};



@export struct DepthFragment {
  alpha: f32,
  depth: f32,
};

@export struct SurfaceFragment {
  position: vec4<f32>,
  normal: vec4<f32>,
  albedo: vec4<f32>,
  emissive: vec4<f32>,
  material: vec4<f32>,
  occlusion: f32,
  depth: f32,
};



@export struct MeshVertex {
  position: vec4<f32>,
  normal: vec3<f32>,
  color: vec4<f32>,
  uv: vec2<f32>,

  index: u32,
};