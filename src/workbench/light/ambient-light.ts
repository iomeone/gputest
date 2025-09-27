import type { LiveComponent, LiveElement } from '../../live';
import type { ColorLike, VectorLike } from '../../traits';
import { parseColor, parseNumber, useProp } from '../../traits';

import { useMemo } from '../../live';

import { useLightCapture } from './lights';
import { useTransformContext } from '../providers/transform-provider';

export type AmbientLightProps = {
  color?: ColorLike,
  intensity?: number,
};

export const AmbientLight = (props: AmbientLightProps) => {
  
  const color = useProp(props.color, parseColor);
  const intensity = useProp(props.intensity, parseNumber, 1);

  const transform = useTransformContext();

  const light = useMemo(() => ({
    kind: 0,
    position: [0, 0, 0, 0],
    color,
    intensity,
    transform,
  }), [color, intensity]);

  useLightCapture(light);
  return null;
};
