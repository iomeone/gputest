struct LightUniforms {
  lightPosition: vec4<f32>,
  lightColor: vec4<f32>,
};

@export @group(LIGHT) @binding(LIGHT) var<uniform> lightUniforms: LightUniforms;
