import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/traits';
import type { ColorTrait, GridTrait, LineTrait, ROPTrait, ScaleTrait, Swizzle } from '../types';

import { parsePosition4, useProp } from '@use-gpu/traits';
import { memo, use, gather, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import {
  useBoundShader, useRawSource, useShaderRef,
  Data, LineLayer,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import {
  parseIntegerPositive,
  parseAxis,
} from '@use-gpu/traits';
import {
  useColorTrait,
  useGridTrait,
  useLineTrait,
  useROPTrait,
  useScaleTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { logarithmic, linear } from '../util/domain';

import { getGridPosition } from '@use-gpu/wgsl/plot/grid.wgsl';
import { getLineSegment } from '@use-gpu/wgsl/geometry/segment.wgsl';

const GRID_BINDINGS = bundleToAttributes(getGridPosition);

export type GridProps =
  Partial<GridTrait> &
  Partial<LineTrait> &
  Partial<ColorTrait> &
  Partial<ROPTrait> & {
  first?: Partial<ScaleTrait> & { detail?: number },
  second?: Partial<ScaleTrait> & { detail?: number },
  origin?: VectorLike,
};

const NO_SCALE_PROPS: Partial<ScaleTrait> = {};

export const Grid: LiveComponent<GridProps> = (props) => {
  const {
    origin,
  } = props;

  const {axes, range} = useGridTrait(props);
  const {width, depth, join, loop} = useLineTrait(props);

  const color = useColorTrait(props);
  const {zBias} = useROPTrait(props);

  const first = useScaleTrait(props.first ?? NO_SCALE_PROPS);
  const second = useScaleTrait(props.second ?? NO_SCALE_PROPS);

  const firstDetail = useProp(props.first?.detail, parseIntegerPositive);
  const secondDetail = useProp(props.second?.detail, parseIntegerPositive);

  const p = useProp(origin, parsePosition4);

  const parentRange = useContext(RangeContext);

  const getGrid = (options: ScaleTrait, detail: number, index: number, other: number) => {
    const main  = parseAxis(axes[index]);
    const cross = parseAxis(axes[other]);

    const r = range?.[index] ?? parentRange[main];
    const r2 = range?.[other] ?? parentRange[cross];

    const newValues = useMemo(() => {
      const f = (options.mode === 'log') ? logarithmic : linear;
      return new Float32Array(f(r[0], r[1], options));
    }, [r[0], r[1], options]);

    const values = useMemo(() => newValues, newValues as any);
    const data = useRawSource(values, 'f32');
    const n = values.length * (detail + 1);

    const min = vec4.clone(p as any);
    min[main] = 0;
    min[cross] = r2[0];

    const max = vec4.clone(p as any);
    max[main] = 0;
    max[cross] = r2[1];

    const a = useShaderRef(main);
    const m1 = useShaderRef(min);
    const m2 = useShaderRef(max);

    const defines = useOne(() => ({ LINE_DETAIL: detail }), detail);
    const bound = useBoundShader(getGridPosition, GRID_BINDINGS, [data, a, m1, m2], defines);

    // Expose position source
    const source = useMemo(() => ({
      shader: bound,
      alloc: (data as any).alloc,
      length: n,
      size: [n],
      version: 0,
    }), [bound]);

    source.length = n;
    source.size[0] = n;

    return source;
  };

  const firstPositions = getGrid(first as any, firstDetail, 0, 1);
  const secondPositions = getGrid(second as any, secondDetail, 1, 0);

  // const firstLoop = loop || props.first?.loop;
  // const secondLoop = loop || props.second?.loop;

  return [
    props.first !== null ? use(LineLayer, {
      positions: firstPositions,
      segments: getLineSegment,

      color,
      width,
      depth,
      join,
      zBias,
    }) : null,
    props.second !== null ? use(LineLayer, {
      positions: secondPositions,
      segments: getLineSegment,

      color,
      width,
      depth,
      join,
      zBias,
    }) : null,
  ];
};

