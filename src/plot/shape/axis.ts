import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/traits';
import type { ArrowTrait, AxisTrait, LineTrait, ColorTrait, ROPTrait } from '../types';

import { memo, use, gather, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import {
  useBoundShader, useBoundSource, useShaderRef,
  LineLayer, ArrowLayer, useArrowSegments,
} from '@use-gpu/workbench';
import { parseIntegerPositive } from '@use-gpu/traits';

import { RangeContext } from '../providers/range-provider';
import { parseVec4, useProp } from '@use-gpu/traits';
import {
  useAxisTrait,
  useArrowTrait,
  useColorTrait,
  useLineTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { getAxisPosition } from '@use-gpu/wgsl/plot/axis.wgsl';

export type AxisProps =
  Partial<AxisTrait> &
  Partial<LineTrait> &
  Partial<ColorTrait> &
  Partial<ROPTrait> &
  Partial<ArrowTrait> & {
  origin?: VectorLike,
  detail?: number,
};

export const Axis: LiveComponent<AxisProps> = (props) => {
  const {
    origin,
    detail,
  } = props;

  const {axis, range} = useAxisTrait(props);
  const {size, start, end} = useArrowTrait(props);
  const {width, depth, join, loop} = useLineTrait(props);

  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const p = useProp(origin, parseVec4);
  const d = useProp(detail, parseIntegerPositive);

  const parentRange = useContext(RangeContext);
  const r = range ?? parentRange[axis];

  // Calculate line origin + step
  const og = vec4.clone(p as any);
  const step = vec4.create();
  const min = r[0];
  const max = r[1];
  og[axis] = min;
  step[axis] = (max - min) / d;

  // Make axis vertex shader
  const o = useShaderRef(og);
  const s = useShaderRef(step);
  const positions = useBoundShader(getAxisPosition, [s, o]);

  // Render as 1 arrow chunk
  const n = d + 1;
  const [chunks, loops] = useMemo(() => [[n], [loop]], [n, loop]);
  const {segments, anchors, trims} = useArrowSegments(chunks, loops, start, end);

  return (
    use(start || end ? ArrowLayer : LineLayer, {
      positions,
      segments,
      anchors,
      trims,
      count: n,

      color,
      width,
      depth,
      size,
      join,
      ...rop,
    })
  );
};

