import type { Ref } from '@use-gpu/live';

import { useCallback, useNoCallback } from '@use-gpu/live';
import { distanceToFrustum } from '@use-gpu/core';
import { vec3, vec4 } from 'gl-matrix';

const sqr = (x: number) => x * x;

export const useFrustumCuller = (
  positionRef: Ref<vec3 | vec4 | number[]>,
  frustumRef: Ref<vec4[]>,
) => useCallback((center: vec3, radius: number) => {
  const {current: frustum} = frustumRef;

  const [x, y, z = 0] = center;
  const d = distanceToFrustum(frustum, x, y, z);

  if (d < -radius) return false;

  const {current: position} = positionRef;
  return sqr(position[0] - x) + sqr(position[1] - y) + sqr(position[2] - z);
}, [positionRef, frustumRef]);

export const useNoFrustumCuller = useNoCallback;
