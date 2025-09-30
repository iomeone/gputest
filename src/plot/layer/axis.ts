import type { LiveComponent } from '../../live';
import type { TraitProps } from '../../traits/index-live';

import { makeUseTrait, combine, trait, shouldEqual, sameShallow } from '../../traits/index-live';
import { memo, use, useMemo } from '../../live';
import {
  useShader, useShaderRef,
  LineLayer, ArrowLayer, useArrowSegmentsSource,
} from '../../workbench';
import { parsePosition, parseIntegerPositive } from '../../parse';

import { useRangeContext } from '../providers/range-provider';
import { vec4 } from 'gl-matrix';

import {
  ArrowTrait,
  AxisTrait,
  DirectedTrait,
  LineTrait,
  LoopTrait,
  ColorTrait,
  ROPTrait,
} from '../traits';
import { getAxisPosition } from '../../wgsl/plot/axiswgsl';

const Traits = combine(
  ArrowTrait,
  AxisTrait,
  DirectedTrait,
  LineTrait,
  LoopTrait,
  ColorTrait,
  ROPTrait,
  trait({
    origin: parsePosition,
    detail: parseIntegerPositive,
  })
);

const useTraits = makeUseTrait(Traits);

export type AxisProps = TraitProps<typeof Traits>;

export const Axis: LiveComponent<AxisProps> = memo((props) => {
  const parsed = useTraits(props);

  const {
    axis, range,
    loop, start, end,
    origin, detail,
    ...flags
  } = parsed;

  const parentRange = useRangeContext();
  const r = range ?? parentRange[axis];

  // Calculate line origin + step
  const og = vec4.clone(origin);
  const step = vec4.create();
  const min = r[0];
  const max = r[1];
  og[axis] = min;
  step[axis] = (max - min) / detail;

  // Make axis vertex shader
  const o = useShaderRef(og);
  const s = useShaderRef(step);
  const positions = useShader(getAxisPosition, [s, o]);

  // Render as 1 arrow chunk
  const n = detail + 1;
  const [chunks, loops] = useMemo(() => [[n], loop], [n, loop]);
  const {segments, anchors, trims} = useArrowSegmentsSource(chunks, null, loops, start, end);

  return useMemo(() => (
    use(start || end ? ArrowLayer : LineLayer, {
      positions,
      segments,
      anchors,
      trims,
      count: n,

      ...flags,
    })
  ), [start, end, positions, segments, anchors, trims, n, props]);
}, shouldEqual({
  origin: sameShallow(),
  range: sameShallow(sameShallow()),
}), 'Axis');
