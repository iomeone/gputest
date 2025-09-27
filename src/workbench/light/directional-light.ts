import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ColorLike, VectorLike } from '@use-gpu/traits';
import { parseColor, parseNumber, parsePosition, useProp } from '@use-gpu/traits';

import { useMemo } from '@use-gpu/live';

import { useLightCapture } from './lights';
import { useTransformContext } from '../providers/transform-provider';

export type DirectionalLightProps = {
  position?: VectorLike,
  scale?: number,
  color?: ColorLike,
  intensity?: number,
};

export const DirectionalLight = (props: DirectionalLightProps) => {
  
  const position = useProp(props.position, parsePosition);
  const color = useProp(props.color, parseColor);
  const intensity = useProp(props.intensity, parseNumber, 1);

  const transform = useTransformContext();

  const light = useMemo(() => ({
    kind: 1,
    position,
    normal: [-position[0], -position[1], -position[2], 0],
    color,
    intensity,
    transform,
  }), [position, color, intensity]);

  useLightCapture(light);
  return null;
};
