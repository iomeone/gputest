import { TypedArray } from '@use-gpu/core/types';
import { vec3, mat4, quat } from 'gl-matrix';

const makeComposeTransform = () => {

  //const euler     = new THREE.Euler();
  const q = quat.create();
  const p = vec3.create();
  const s = vec3.create();
  const t = mat4.create();

  return (
    transform: mat4,
    position?: TypedArray | null,
    rotation?: TypedArray | null,
    quaternion?: TypedArray | null,
    scale?: TypedArray | null,
    matrix?: TypedArray | null,
    // eulerOrder = 'XYZ',
  ) => {

    if (rotation != null) {
      quat.fromEuler(q, rotation[0], rotation[1], rotation[2]);
      //eulerOrder = exports.swizzleToEulerOrder eulerOrder if eulerOrder instanceof Array
      //euler.setFromVector3 rotation, eulerOrder
    } else quat.identity(q);

    if (quaternion != null) quat.multiply(q, quaternion);

    if (position != null) vec3.copy(p, position);
    else vec3.zero(p);

    if (scale != null) vec3.copy(s, scale);
    else vec3.set(s, 1, 1, 1);
    
    mat4.fromRotationTranslationScale(transform, q, p, s);
    return transform;
  }
}

export const composeTransform = makeComposeTransform();