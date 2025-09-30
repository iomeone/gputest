@export struct ViewUniforms {
  projectionViewFrustum: array<vec4<f32>,6>,
  projectionViewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  inverseProjectionViewMatrix: mat4x4<f32>,
  inverseProjectionMatrix: mat4x4<f32>,
  inverseViewMatrix: mat4x4<f32>,
  viewPosition: vec4<f32>,
  viewNearFar: vec2<f32>,
  viewResolution: vec2<f32>,
  viewSize: vec2<f32>,
  viewWorldScale: vec3<f32>,
  viewPixelRatio: f32,
};

@export @group(PASS) @binding(0) var<uniform> viewUniforms: ViewUniforms;

@export fn getViewPosition() -> vec4<f32> { return viewUniforms.viewPosition; }
@export fn getViewResolution() -> vec2<f32> { return viewUniforms.viewResolution; }
@export fn getViewSize() -> vec2<f32> { return viewUniforms.viewSize; }
@export fn getViewNearFar() -> vec2<f32> { return viewUniforms.viewNearFar; }
@export fn getViewPixelRatio() -> f32 { return viewUniforms.viewPixelRatio; }

@export fn getViewVector(world: vec3<f32>) -> vec3<f32> {
  let pos = viewUniforms.viewPosition;
  return pos.xyz - world * pos.w;
}

@export fn to3D(position: vec4<f32>) -> vec3<f32> {
  return position.xyz / position.w;
}

@export fn worldToView(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.viewMatrix * position;
}

@export fn viewToWorld(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.inverseViewMatrix * position;
}

@export fn viewToClip(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.projectionMatrix * position;
}

@export fn clipToView(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.inverseProjectionMatrix * position;
}

@export fn worldToClip(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.projectionViewMatrix * position;
}

@export fn clipToWorld(position: vec4<f32>) -> vec4<f32> {
  return viewUniforms.inverseProjectionViewMatrix * position;
}

@export fn worldToW(position: vec4<f32>) -> f32 {
  let pvm = viewUniforms.projectionViewMatrix;
  let w = dot(vec4<f32>(pvm[0][3], pvm[1][3], pvm[2][3], pvm[3][3]), position);
  return w;
}

@export fn viewToW(position: vec4<f32>) -> f32 {
  let pvm = viewUniforms.projectionMatrix;
  let w = dot(vec4<f32>(pvm[0][3], pvm[1][3], pvm[2][3], pvm[3][3]), position);
  return w;
}

@export fn worldToDepth(position: vec4<f32>) -> f32 {
  let pvm = viewUniforms.projectionViewMatrix;
  let z = dot(vec4<f32>(pvm[0][2], pvm[1][2], pvm[2][2], pvm[3][2]), position);
  let w = dot(vec4<f32>(pvm[0][3], pvm[1][3], pvm[2][3], pvm[3][3]), position);
  return z / w;
}

@export fn viewToDepth(position: vec4<f32>) -> f32 {
  let pm = viewUniforms.projectionMatrix;
  let z = dot(vec4<f32>(pm[0][2], pm[1][2], pm[2][2], pm[3][2]), position);
  let w = dot(vec4<f32>(pm[0][3], pm[1][3], pm[2][3], pm[3][3]), position);
  return z / w;
}

@export fn depthToView(depth: f32) -> f32 {
  let pm = viewUniforms.inverseProjectionMatrix;
  let z = dot(vec2<f32>(pm[2][2], pm[3][2]), vec2<f32>(depth, 1.0));
  let w = dot(vec2<f32>(pm[2][3], pm[3][3]), vec2<f32>(depth, 1.0));
  return z / w;
}

@export fn clipToWorld3D(position: vec4<f32>) -> vec3<f32> {
  return to3D(clipToWorld(position));
}

@export fn worldToClip3D(position: vec4<f32>) -> vec3<f32> {
  return to3D(worldToClip(position));
}

@export fn clip3DToScreen(position: vec3<f32>) -> vec2<f32> {
  return position.xy * viewUniforms.viewSize;
}

@export fn screenToClip3D(position: vec2<f32>, z: f32) -> vec3<f32> {
  return vec3(position.xy * viewUniforms.viewResolution, z);
}

@export fn clipXYToUV(clip: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(clip.x, -clip.y) * .5 + .5;
}

@export fn clipUVToXY(uv: vec2<f32>) -> vec2<f32> {
  let xy = uv * 2.0 - 1.0;
  return vec2<f32>(xy.x, -xy.y);
}

@export fn clipLineIntoView(anchor: vec4<f32>, head: vec4<f32>) -> vec4<f32> {
  let near = viewUniforms.viewNearFar.x * 2.0;

  let d = anchor - head;
  if (dot(d, d) == 0.0) { return worldToView(anchor); }

  let a = worldToView(anchor);
  let b = worldToView(head);

  if (-a.z < near) {
    if (abs(b.z - a.z) > 0.001) {
      let ratio = (near + a.z) / (a.z - b.z);
      return mix(a, b, ratio);
    }
  }

  return a;
}

// Screen-space sizing in world space (or absolute)
@export fn getWorldScale(w: f32, f: f32) -> f32 {
  return getScreenScale(w, f) * getClipToWorldScale() * w;
}

// Screen-space sizing in screen space (or absolute)
@export fn getScreenScale(w: f32, f: f32) -> f32 {
  if (f < 0.0) {
    // Fixed world-space units
    return getWorldToClipScale() / w;
  }

  let worldScale = viewUniforms.viewWorldScale.y;
  let clipScale = mix(1.0, worldScale / w, f);
  let pixelScale = clipScale * viewUniforms.viewPixelRatio;

  return pixelScale;
}

// Ratio of world-space units to clip space units
@export fn getWorldToClipScale() -> f32 {
  return 1 / viewUniforms.viewWorldScale.x;
}

@export fn getClipToWorldScale() -> f32 {
  return viewUniforms.viewWorldScale.x;
}

@export fn applyZBias3(position: vec3<f32>, zBias: f32, w: f32) -> vec3<f32> {
  let m = viewUniforms.projectionMatrix;
  let v = viewUniforms.viewResolution;
  let zw = m[2].w;

  let zScale = viewUniforms.viewWorldScale.z;

  if (zw < 0.0) {
    // reversed z - perspective
    let z = m[3].z / (-w + w * zBias * v.y * zScale) + m[2].z;
    return vec3<f32>(position.xy, -z);
  }
  else if (zw > 0.0) {
    // normal z - perspective
    let z = m[3].z / (w + w * zBias * v.y * zScale) + m[2].z;
    return vec3<f32>(position.xy, z);
  }
  else {
    // orthographic
    let w = (position.z - m[3].z) / m[2].z;
    var z = (w - zBias * v.y * zScale) * m[2].z + m[3].z;
    return vec3<f32>(position.xy, z);
  }
}

@export fn applyZBias(position: vec4<f32>, zBias: f32) -> vec4<f32> {
  let m = viewUniforms.projectionMatrix;
  let v = viewUniforms.viewResolution;
  let w = position.w;

  let zScale = viewUniforms.viewWorldScale.z;

  let zw = m[2].w;
  if (zw < 0.0) {
    // reversed z - perspective
    let z = m[3].z / (-w + w * zBias * v.y * zScale) + m[2].z;
    return vec4<f32>(position.xy, -z * w, w);
  }
  else if (zw > 0.0) {
    // normal z - perspective
    let z = m[3].z / (w + w * zBias * v.y * zScale) + m[2].z;
    return vec4<f32>(position.xy, z * w, w);
  }
  else {
    // orthographic
    let w = (position.z - m[3].z) / m[2].z;
    let z = (w - zBias * v.y * zScale) * m[2].z + m[3].z;
    return vec4<f32>(position.xy, z, 1.0);
  }
}

