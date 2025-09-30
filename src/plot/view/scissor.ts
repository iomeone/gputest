import type { LC, PropsWithChildren } from '../../live';
import type { Lazy } from '../../core';

import { provide, useMemo, useOne } from '../../live';
import { ScissorContext, useShader, useShaderRefs } from '../../workbench';

import { useRangeContext, useNoRangeContext } from '../providers/range-provider';

import { getScissorLevel } from '../../wgsl/transform/scissorwgsl';

const NO_LOOP = [0, 0, 0, 0];

export type ScissorProps = PropsWithChildren<{
  loop?: boolean[] | number[],
  bias?: number,
  range?: [number, number][],
}>;

export const Scissor: LC<ScissorProps> = (props: ScissorProps) => {
  const {loop = NO_LOOP, bias = 0.5, children} = props;

  const range = props.range ? (useNoRangeContext(), props.range) : useRangeContext();

  const min = useOne(() => range.map((r, i) => i < 3 ? r[0] : [0, 2]), range);
  const max = useOne(() => range.map((r, i) => i < 3 ? r[1] : [0, 2]), range);

  const defines = useMemo(() => ({
    HAS_SCISSOR_LOOP: loop.some(x => !!x),
    SCISSOR_BIAS: bias,
  }), [loop, bias]);

  const bound = useShader(getScissorLevel, useShaderRefs(min, max, loop as Lazy<number[]>), defines);

  return provide(ScissorContext, bound, children);
};
