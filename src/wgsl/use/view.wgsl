struct ViewUniforms {
  projectionMatrix: mat4x4<f32>;
  viewMatrix: mat4x4<f32>;
  viewPosition: vec4<f32>;
  viewResolution: vec2<f32>;
  viewSize: vec2<f32>;
  viewWorldUnit: f32;
  viewPixelRatio: f32;
};

@export @group(VIEW) @binding(VIEW) var<uniform> viewUniforms: ViewUniforms;

@export fn worldToView(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.viewMatrix * position;
}

@export fn viewToClip(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.projectionMatrix * position;
}

@export fn worldToClip(position: vec4<f32>) -> vec4<f32> {
  return viewToClip(worldToView(position));
}

@export fn clipToScreen3D(position: vec4<f32>) -> vec3<f32> {
  return vec3(position.xy * viewUniforms.viewSize, position.z);
}

@export fn screenToClip3D(position: vec4<f32>) -> vec3<f32> {
  return vec3(position.xy * viewUniforms.viewResolution, position.z);
}

@export fn worldToClip3D(position: vec4<f32>) -> vec3<f32> {
  var pos = viewToClip(worldToView(position));
  return pos.xyz / pos.w;
}

@export fn getPerspectiveScale(w: f32, f: f32) -> f32 {
  var m = viewUniforms.projectionMatrix;
  var worldScale = m[1][1] * viewUniforms.viewWorldUnit;
  var clipScale = mix(1.0, worldScale / w, f);
  var pixelScale = clipScale * viewUniforms.viewPixelRatio;
  return pixelScale;
}
