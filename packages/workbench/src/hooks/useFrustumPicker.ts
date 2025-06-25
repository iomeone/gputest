import type { Ref } from '@use-gpu/live';

import { useCallback } from '@use-gpu/live';
import { mat4, vec3 } from 'gl-matrix';

import { PointerEvent } from '../interact/types';

export const useFrustumPicker = (inverseProjectionViewMatrixRef: Ref<mat4>) =>
  useCallback((event: PointerEvent) => {
    const {current: inverseProjectionViewMatrix} = inverseProjectionViewMatrixRef;

    const {u, v} = event;
    const v1 = vec3.fromValues(u * 2 - 1, 1 - v * 2, 1);
    const v2 = vec3.fromValues(u * 2 - 1, 1 - v * 2, 0.001);

    vec3.transformMat4(v1, v1, inverseProjectionViewMatrix);
    vec3.transformMat4(v2, v2, inverseProjectionViewMatrix);

    vec3.sub(v2, v2, v1);

    return [v1, v2];
  }, [inverseProjectionViewMatrixRef]);
