import type { VectorLike } from '@use-gpu/core';
import { vec4, mat4, quat } from 'gl-matrix';

const makeComposeTransform4D = () => {

  const s = vec4.create();
  const m = mat4.create();

  const quatToMatrixL = (m: mat4, q: VectorLike) => {
    const [a, b, c, d] = q;
    mat4.set(
      m,
      d, a, b, c,
      -a, d, c, -b,
      -b, -c, d, a,
      -c, b, -a, d,
    );
  };

  const quatToMatrixR = (m: mat4, q: VectorLike) => {
    const [a, b, c, d] = q;
    mat4.set(
      m,
      d, a, b, c,
      -a, d, -c, b,
      -b, c, d, -a,
      -c, -b, a, d,
    );
  };

  return (
    transform: mat4,
    base: vec4,
    position?: VectorLike | null,
    leftQuaternion?: VectorLike | null,
    rightQuaternion?: VectorLike | null,
    scale?: VectorLike | null,
    matrix?: VectorLike | null,
  ) => {

    mat4.identity(transform);

    if (position != null) vec4.copy(base, position as any);
    else vec4.zero(base);

    if (scale != null) {
      vec4.copy(s, scale as any);
      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          transform[i * 4 + j] *= s[i];
        }
      }
    }
    

    if (rightQuaternion != null) {
      quatToMatrixR(m, rightQuaternion);
      mat4.multiply(transform, m, transform);
    }
    if (leftQuaternion != null) {
      quatToMatrixL(m, leftQuaternion);
      mat4.multiply(transform, m, transform);
    }

    if (matrix != null) mat4.multiply(transform, matrix as mat4, transform);
  }
}

export const composeTransform4D = makeComposeTransform4D();
