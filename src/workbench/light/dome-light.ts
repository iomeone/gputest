import type { ColorLike, VectorLike } from '@use-gpu/core';
import { useProp } from '@use-gpu/traits/live';
import { parseColor, parseNumber, parsePosition } from '@use-gpu/parse';

import { memo, useMemo } from '@use-gpu/live';

import { useLightContext } from '../providers/light-provider';
import { useMatrixContext } from '../providers/matrix-provider';

import { vec4 } from 'gl-matrix';

import { DOME_LIGHT } from './types';

export type DomeLightProps = {
  direction?: VectorLike,
  horizon?: ColorLike,
  zenith?: ColorLike,
  intensity?: number,
  bleed?: number,
};

const DEFAULT_DIRECTION = vec4.fromValues(0, -1, 0, 1);

export const DomeLight = memo((props: DomeLightProps) => {

  const direction = useProp(props.direction, parsePosition, DEFAULT_DIRECTION);
  const horizon = useProp(props.horizon, parseColor, [1, 1, 1, 1]);
  const zenith = useProp(props.zenith, parseColor, [.5, .5, .5, 1]);

  const intensity = useProp(props.intensity, parseNumber, 1);
  const bleed = useProp(props.bleed, parseNumber, 0.25);

  const parent = useMatrixContext();

  const light = useMemo(() => {
    const normal = vec4.clone(direction as any as vec4);
    if (parent) {
      normal[3] = 0;
      vec4.transformMat4(normal, normal, parent);
    }
    normal[3] = bleed;

    return {
      kind: DOME_LIGHT,
      normal,
      color: zenith,
      opts: horizon,
      intensity,
    };
  }, [direction, zenith, horizon, intensity, parent]);

  const {useLight} = useLightContext();
  useLight(light);

  return null;
}, 'DomeLight');
