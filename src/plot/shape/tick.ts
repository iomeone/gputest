import type { LiveComponent } from '../../live';
import type { UniformAttribute } from '../../core';
import type { VectorLike } from '../../traits';
import type { ColorTrait, LineTrait, ROPTrait } from '../types';

import { parseNumber, parsePosition4, parseIntegerPositive, useProp } from '../../traits';
import { use, provide, useCallback, useContext, useOne, useMemo } from '../../live';
import { diffBy } from '../../shader/wgsl';
import { useBoundSource, TickLayer } from '../../workbench';

import { DataContext } from '../providers/data-provider';
import { RangeContext } from '../providers/range-provider';
import {
  useColorTrait,
  useLineTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

export type TickProps =
  Partial<ColorTrait> &
  Partial<LineTrait> &
  Partial<ROPTrait> & {
  base?: number,
  size?: number,
  detail?: number,
  offset?: VectorLike,
};

const NO_OFFSET = vec4.fromValues(0, 1, 0, 0);
const GET_POSITION = {format: 'vec4<f32>', name: 'getPosition'} as UniformAttribute;
const GET_SIZE = {format: 'u32', name: 'getSize', args: []} as UniformAttribute;

export const Tick: LiveComponent<TickProps> = (props) => {
  const {
    size = 5,
    detail = 1,
    base = 10,
    offset = NO_OFFSET
  } = props;

  const positions = useContext(DataContext) ?? undefined;
  const count = useCallback(() => (positions as any)?.length, [positions]);

  const {width, depth, join} = useLineTrait(props);
  const color = useColorTrait(props);
  const {zBias} = useROPTrait(props);

  const s = useProp(size, parseNumber);
  const d = useProp(detail, parseIntegerPositive);
  const o = useProp(offset, parsePosition4);

  const getPosition = useBoundSource(GET_POSITION, positions);
  const getSize = useBoundSource(GET_SIZE, count);
  const tangents = diffBy(getPosition, [-1], getSize);

  return (
    use(TickLayer, {
      positions,
      offset: o,
      detail: d,
      base,
      tangents,
      count,

      color,
      width,
      depth,
      zBias,
      size: s,
      join,
    })
  );
};

