import type { VectorLike } from '@use-gpu/core';
import { vec3, mat4, quat } from 'gl-matrix';

const makeComposeTransform = () => {

  const q = quat.create();
  const p = vec3.create();
  const s = vec3.create();

  const qs = quat.create();

  return (
    transform: mat4,
    position?: VectorLike | null,
    rotation?: VectorLike | null,
    quaternion?: VectorLike | null,
    scale?: VectorLike | null,
    matrix?: VectorLike | null,
    eulerOrder = 'xyz',
  ) => {

    if (rotation != null) {
      quat.identity(q);
      for (const l of eulerOrder.split('')) {
        if      (l === 'x') { quat.fromEuler(qs, rotation[0], 0, 0); quat.multiply(q, q, qs); }
        else if (l === 'y') { quat.fromEuler(qs, 0, rotation[1], 0); quat.multiply(q, q, qs); }
        else if (l === 'z') { quat.fromEuler(qs, 0, 0, rotation[2]); quat.multiply(q, q, qs); }
      }
    } else quat.identity(q);

    if (quaternion != null) quat.multiply(q, q, quaternion as any);

    if (position != null) vec3.copy(p, position as any);
    else vec3.zero(p);

    if (scale != null) vec3.copy(s, scale as any);
    else vec3.set(s, 1, 1, 1);

    mat4.fromRotationTranslationScale(transform, q, p, s);
    if (matrix != null) mat4.multiply(transform, matrix as mat4, transform);

    return transform;
  }
}

export const composeTransform = makeComposeTransform();