import type { LiveComponent, LiveElement } from '../../live';
import type { ColorLike, VectorLike } from '../../traits';
import { parseColor, parseNumber, useProp } from '../../traits';

import { memo, useMemo } from '../../live';
import { useLightContext } from '../providers/light-provider';

import { AMBIENT_LIGHT } from './types';
import { vec4 } from 'gl-matrix';

const WHITE = vec4.fromValues(1, 1, 1, 1);

export type AmbientLightProps = {
  color?: ColorLike,
  intensity?: number,
};

export const AmbientLight = memo((props: AmbientLightProps) => {
  
  const color = useProp(props.color, parseColor, WHITE);
  const intensity = useProp(props.intensity, parseNumber, 1);

  const light = useMemo(() => ({
    kind: AMBIENT_LIGHT,
    color,
    intensity,
  }), [color, intensity]);

  const {useLight} = useLightContext();
  useLight(light);

  return null;
}, 'AmbientLight');
