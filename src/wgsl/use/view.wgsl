struct ViewUniforms {
  projectionMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  viewPosition: vec4<f32>,
  viewNearFar: vec2<f32>,
  viewResolution: vec2<f32>,
  viewSize: vec2<f32>,
  viewWorldUnit: f32,
  viewPixelRatio: f32,
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
  return toClip3D(viewToClip(worldToView(position)));
}

@export fn toClip3D(position: vec4<f32>) -> vec3<f32> {
  return position.xyz / position.w;
}

@export fn clipLineIntoView(anchor: vec4<f32>, head: vec4<f32>, near: f32) -> vec4<f32> {
  var d = anchor - head;
  if (dot(d, d) == 0.0) { return worldToView(anchor); }

  var a = worldToView(anchor);
  var b = worldToView(head);

  if (-a.z < near) {
    if (abs(b.z - a.z) > 0.001) {
      let ratio = (near + a.z) / (a.z - b.z);
      return mix(a, b, ratio);
    }
  }

  return a;
}

@export fn getWorldScale(w: f32, f: f32) -> f32 {
  var v = viewUniforms.viewResolution;
  return getPerspectiveScale(w, f) * v.y * w;
}

@export fn getPerspectiveScale(w: f32, f: f32) -> f32 {
  var m = viewUniforms.projectionMatrix;
  var worldScale = m[1][1] * viewUniforms.viewWorldUnit;
  var clipScale = mix(1.0, worldScale / w, f);
  var pixelScale = clipScale * viewUniforms.viewPixelRatio;
  return pixelScale;
}
