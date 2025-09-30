import type { LC } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';

import { memo, use } from '@use-gpu/live';
import { PointLayer } from '../layers/point-layer';

type PointHelperProps = {
  position?: number[] | TypedArray,
  color?: number[] | TypedArray,
  size?: number,
};

const EMPTY: any[] = [];

export const PointHelper: LC<PointHelperProps> = memo((props: PointHelperProps) => {
  const {
    position = EMPTY,
    color = [1, 0.75, 0.5, 1],
    size = 10,
  } = props;

  const p = [position[0] || 0, position[1] || 0, position[2] || 0, 1];

  return use(PointLayer, { position: p, color, size, count: 1 });
}, 'PointHelper');
