import type { UniformAttribute } from './types';

import { mat4, vec3, vec4 } from 'gl-matrix';

export const VIEW_UNIFORMS: UniformAttribute[] = [
  {
    name: 'projectionViewMatrix',
    format: 'mat4x4<f32>',
  },
  {
    name: 'projectionMatrix',
    format: 'mat4x4<f32>',
  },
  {
    name: 'viewMatrix',
    format: 'mat4x4<f32>',
  },
  {
    name: 'inverseProjectionViewMatrix',
    format: 'mat4x4<f32>',
  },
  {
    name: 'inverseViewMatrix',
    format: 'mat4x4<f32>',
  },
  {
    name: 'viewPosition',
    format: 'vec4<f32>'
  },
  {
    name: 'viewNearFar',
    format: 'vec2<f32>'
  },
  {
    name: 'viewResolution',
    format: 'vec2<f32>',
  },
  {
    name: 'viewSize',
    format: 'vec2<f32>',
  },
  {
    name: 'viewWorldDepth',
    format: 'vec2<f32>',
  },
  {
    name: 'viewPixelRatio',
    format: 'f32',
  },
];

export const makeOrthogonalMatrix = (
  left: number,
  right: number,
  top: number,
  bottom: number,
  near: number,
  far: number,
): mat4 => {
  const x = 2 / (right - left);
  const y = 2 / (bottom - top);
  const z = -1 / (far - near);

  const wx = -(right + left) / (right - left);
  const wy = -(bottom + top) / (bottom - top);
  const wz = -(near) / (far - near);

  const matrix = mat4.create();
  mat4.set(matrix,
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    wx, wy, wz, 1,
  );

  return matrix;
}

export const makeProjectionMatrix = (
  width: number,
  height: number,
  fov: number,
  near: number,
  far: number,
  radius: number = 1,
  dolly: number = 1,
): mat4 => {
  const aspect = width / height;
  let matrix;

  if (dolly === 1) {
    // Normal GL perspective matrix
    matrix = mat4.create();
    mat4.perspective(matrix, fov, aspect, near, far);

    // Move Z from 0..1 to 1..0 in clip space (reversed Z)
    const z = mat4.create();
    mat4.translate(z, z, vec3.fromValues(0, 0, 1));
    mat4.scale(z, z, vec3.fromValues(1, 1, -1));
    mat4.multiply(matrix, z, matrix);
  }
  else if (dolly > 0) {
    const shift = (1 / dolly - 1) * radius;
    const dFov = Math.atan(Math.tan(fov / 2) * dolly) * 2;
    const dNear = near + shift;
    const dFar = far + shift;

    // GL perspective matrix with reduced FOV and shifted near/far plane
    matrix = mat4.create();
    mat4.perspectiveZO(matrix, dFov, aspect, dNear, dFar);

    // Move Z from 0..1 to 1..0 in clip space (reversed Z)
    const z = mat4.create();
    mat4.translate(z, z, vec3.fromValues(0, 0, 1));
    mat4.scale(z, z, vec3.fromValues(1, 1, -1));
    mat4.multiply(matrix, z, matrix);
  }
  else {
    // Orthogonal matrix
    const s = radius * Math.tan(fov / 2);
    matrix = makeOrthogonalMatrix(-aspect * s, aspect * s, -s, s, far, near);
  }

  return matrix;
}

const NO_TARGET = [0, 0, 0];

export const makeOrbitMatrix = (
  radius: number,
  phi: number,
  theta: number,
  target: number[] | vec3 | vec4 = NO_TARGET,
  dolly: number = 1,
): mat4 => {

  const matrix = mat4.create();
  mat4.translate(matrix, matrix, vec3.fromValues(0, 0, -radius / (dolly || 1)));
  mat4.rotate(matrix, matrix, theta, vec3.fromValues(1, 0, 0));
  mat4.rotate(matrix, matrix, phi, vec3.fromValues(0, 1, 0));

  const t = [-target[0], -target[1], -target[2]] as any as vec3;
  mat4.translate(matrix, matrix, t);

  return matrix;
}

export const makeOrbitPosition = (
  radius: number,
  phi: number,
  theta: number,
  target: number[] | vec3 | vec4 = NO_TARGET,
  dolly: number = 1,
): vec4 => {
  const ct = Math.cos(theta);
  radius /= Math.max(1e-5, dolly);
  return vec4.fromValues(
    -Math.sin(phi) * ct * radius + (target[0] || 0),
    Math.sin(theta) * radius + (target[1] || 0),
    Math.cos(phi) * ct * radius + (target[2] || 0),
    1,
  );
}

export const makePanMatrix = (x: number, y: number, zoom: number, dolly: number): mat4 => {
  const matrix = mat4.create();
  mat4.translate(matrix, matrix, vec3.fromValues(x, y, 1 - 1 / (dolly || 1)));
  mat4.scale(matrix, matrix, vec3.fromValues(zoom, zoom, zoom));
  return matrix;
}

export const makePanPosition = (x: number, y: number, zoom: number, dolly: number): vec4 => {
  const z = 1 - 1 / Math.max(1e-5, dolly);
  return vec4.fromValues(x, y, z, 1);
}

export const makeFrustumPlanes = (m: mat4): vec4[] => {
  const out = [];

  out.push(vec4.fromValues(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]));
  out.push(vec4.fromValues(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]));

  out.push(vec4.fromValues(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]));
  out.push(vec4.fromValues(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]));

  out.push(vec4.fromValues(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]));
  out.push(vec4.fromValues(       m[2],        m[6],         m[10],         m[14]));

  for (const v of out) vec4.scale(v, v, 1/Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]));

  return out;
};

export const distanceToFrustum = (frustum: vec4[], x: number, y: number, z: number): number => {
  let min = Infinity;
  for (const v of frustum) {
    const d = v[0]*x + v[1]*y + v[2]*z + v[3];
    min = Math.min(min, d);
  }
  return min;
};
