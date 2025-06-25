import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parseVec3 } from '@use-gpu/parse';
import { useMemo } from '@use-gpu/live';

import { useRenderProp } from '../hooks/useRenderProp';
import { OrbitCameraProps } from './orbit-camera';

import { vec3 } from 'gl-matrix';

const DEFAULT_LOOK_AT = {
  position: [0, 0, 0],
  target: [0, 0, 1],
};

export type LookAtProps = {
  position?: VectorLike,
  target?: VectorLike,

  render?: (orbit: OrbitCameraProps) => LiveElement,
  children?: (orbit: OrbitCameraProps) => LiveElement,
};

export const LookAt: LiveComponent<LookAtProps> = (props) => {
  const position = useProp(props.position, parseVec3, DEFAULT_LOOK_AT.position as vec3);
  const target = useProp(props.target, parseVec3, DEFAULT_LOOK_AT.target as vec3);

  const orbit = useMemo(() => {

    const delta = vec3.sub(vec3.create(), target, position);

    const bearing = -Math.atan2(delta[0], delta[2]) + Math.PI;
    const pitch = -Math.atan2(delta[1], Math.hypot(delta[0], delta[2]));
    const radius = vec3.length(delta);

    return {bearing, pitch, radius, target};
  }, [position, target]);

  return useRenderProp(props, orbit);
};
