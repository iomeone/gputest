import type { LC } from '../../live';
import type { Blending, VectorLike } from '../../core';
import { use } from '../../live';

import { useShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';
import { useAnimationFrame } from '../providers/loop-provider';
import { useTimeContext } from '../providers/time-provider';
import { RawQuads } from '../primitives/raw-quads';

import { getLoadingSpinnerMask } from '../../wgsl/mask/loadingwgsl';

export type LoadingSpinnerProps = {
  blend?: Blending,
  position?: VectorLike,
  color?: VectorLike,
  size?: number,
};

const WHITE = [1, 1, 1, 1];
const ORIGIN = [0, 0, 0, 1];

export const LoadingSpinner: LC<LoadingSpinnerProps> = (props: LoadingSpinnerProps) => {
  const {
    position = ORIGIN,
    blend = 'normal',
    color = WHITE,
    size = 64,
  } = props;

  const time = useTimeContext();
  useAnimationFrame();

  const s2 = size / 2;
  const t = useShaderRef(time.elapsed / 1000);
  const mask = useShader(getLoadingSpinnerMask, [t]);

  return [
    use(RawQuads, {
      count: 1,
      position,
      rectangle: [-s2, -s2, s2, s2],
      color,
      mask,
      blend,
      mode: 'transparent',
    })
  ];
};
