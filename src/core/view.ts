import { mat4, vec3 } from 'gl-matrix';

import { UniformAttribute, UniformType } from './types';

export const VIEW_UNIFORMS: UniformAttribute[] = [
  {
    name: 'projectionMatrix',
    format: UniformType['mat4x4<f32>'],
  },
  {
    name: 'viewMatrix',
    format: UniformType['mat4x4<f32>'],
  },
  {
    name: 'viewPosition',
    format: UniformType['vec4<f32>']
  },
  {
    name: 'viewNearFar',
    format: UniformType['vec2<f32>']
  },
  {
    name: 'viewResolution',
    format: UniformType['vec2<f32>'],
  },
  {
    name: 'viewSize',
    format: UniformType['vec2<f32>'],
  },
  {
    name: 'viewWorldUnit',
    format: UniformType.f32,
  },
  {
    name: 'viewPixelRatio',
    format: UniformType.f32,
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

let t = 0;

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

    // Move Z from -1..1 to 0..1 in clip space
    const z = mat4.create();
    mat4.translate(z, z, vec3.fromValues(0, 0, 0.5));
    mat4.scale(z, z, vec3.fromValues(1, 1, 0.5));
    mat4.multiply(matrix, z, matrix);
  }
  else if (dolly > 0) {
    const shift = (1 / dolly - 1) * radius;
    const dFov = Math.atan(Math.tan(fov / 2) * dolly) * 2;
    const dNear = near + shift;
    const dFar = far + shift;

    // GL perspective matrix with reduced FOV and shifted near/far plane
    matrix = mat4.create();
    mat4.perspective(matrix, dFov, aspect, dNear, dFar);

    // Move Z from -1..1 to 0..1 in clip space
    const z = mat4.create();
    mat4.translate(z, z, vec3.fromValues(0, 0, 0.5));
    mat4.scale(z, z, vec3.fromValues(1, 1, 0.5));
    mat4.multiply(matrix, z, matrix);
  }
  else {
    // Orthogonal matrix
    const s = radius * Math.tan(fov / 2);
    matrix = makeOrthogonalMatrix(-aspect * s, aspect * s, -s, s, near, far);
  }

  return matrix;
}

export const makeOrbitMatrix = (radius: number, phi: number, theta: number, dolly: number): mat4 => {
  const matrix = mat4.create();
  mat4.translate(matrix, matrix, vec3.fromValues(0, 0, -radius / (dolly || 1)));
  mat4.rotate(matrix, matrix, theta, vec3.fromValues(1, 0, 0));
  mat4.rotate(matrix, matrix, phi, vec3.fromValues(0, 1, 0));
  return matrix;
}

export const makeOrbitPosition = (radius: number, phi: number, theta: number, dolly: number): number[] => {
  const ct = Math.cos(theta);
  radius /= Math.max(1e-5, dolly);
  return [
    -Math.sin(phi) * ct * radius,
    Math.sin(theta) * radius,
    Math.cos(phi) * ct * radius,
  ];
}

