import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { ColorTrait, GridTrait, LineTrait, ROPTrait, ScaleTrait, VectorLike, Swizzle } from '../types';

import { memo, use, gather, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import { useBoundShader } from '../../hooks/useBoundShader';
import { useBoundStorage } from '../../hooks/useBoundStorage';
import { useShaderRef } from '../../hooks/useShaderRef';

import { RangeContext } from '../../providers/range-provider';
import {
  parseDetail,
  parsePosition4,
  parseAxis,
} from '../util/parse';
import {
  useColorTrait,
  useGridTrait,
  useLineTrait,
  useROPTrait,
  useScaleTrait,
  useProp,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { logarithmic, linear } from '../util/domain';
import { Data } from '../../data/data';
import { LineLayer } from '../../layers/line-layer';

import { getGridPosition } from '@use-gpu/wgsl/plot/grid.wgsl';
import { getLineSegment } from '@use-gpu/wgsl/geometry/line.wgsl';

const GRID_BINDINGS = [
  { name: 'getGridValue', format: 'f32', value: 0 },
  { name: 'getGridDirection', format: 'i32', value: 0 },
  { name: 'getGridMin', format: 'vec4<f32>', value: vec4.fromValues(0, 0, 0, 0) },
  { name: 'getGridMax', format: 'vec4<f32>', value: vec4.fromValues(0, 0, 0, 0) },
];

export type GridProps =
  Partial<GridTrait> &
  Partial<LineTrait> &
  Partial<ColorTrait> &
  Partial<ROPTrait> & {
  first?: Partial<ScaleTrait> & { detail: number },
  second?: Partial<ScaleTrait> & { detail: number },
  origin?: VectorLike,
};

const NO_PROPS: Record<string, any> = {};

export const Grid: LiveComponent<GridProps> = (props) => {
  const {
    origin,
  } = props;

  const {axes, range} = useGridTrait(props);
  const {width, depth, join, loop} = useLineTrait(props);

  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const first = useScaleTrait(props.first ?? NO_PROPS);
  const second = useScaleTrait(props.second ?? NO_PROPS);

  const firstDetail = useProp(props.first?.detail, parseDetail);
  const secondDetail = useProp(props.second?.detail, parseDetail);

  const p = useProp(origin, parsePosition4);

  const parentRange = useContext(RangeContext);

  const getGrid = (options: DomainOptions, detail: number, index: number, other: number) => {
    const main  = parseAxis(axes[index]);
    const cross = parseAxis(axes[other]);

    const r = range?.[index] ?? parentRange[main];
    const r2 = range?.[other] ?? parentRange[cross];

    const newValues = useMemo(() => {
      const f = (options.mode === 'log') ? logarithmic : linear;
      return new Float32Array(f(r[0], r[1], options));
    }, [r[0], r[1], options]);

    const values = useMemo(() => newValues, newValues);
    const data = useBoundStorage(values, 'f32');
    const n = values.length * (detail + 1);

    const min = vec4.clone(p);
    min[main] = 0;
    min[cross] = r2[0];

    const max = vec4.clone(p);
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
      alloc: data.alloc,
      length: n,
      size: [n],
      version: 0,
    }), [bound]);

    source.length = n;
    source.size[0] = n;

    return source;
  };

  const firstPositions = getGrid(first, firstDetail, 0, 1);
  const secondPositions = getGrid(second, secondDetail, 1, 0);

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
    }) : null,
    props.second !== null ? use(LineLayer, {
      positions: secondPositions,
      segments: getLineSegment,

      color,
      width,
      depth,
      join,
    }) : null,
  ];
};

