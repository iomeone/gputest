import type { LiveComponent } from '../../live';
import type { ShaderModule } from '../../shader';
import type { XYZW } from '../../core';
import type { TraitProps } from '../../traits';

import { makeUseTrait, optional, combine, trait, shouldEqual, sameShallow, useProp } from '../../traits/live';
import { parseBoolean, parseIntegerPositive, parseAxis, parsePosition } from '../../parse';
import { memo, use, fragment, useOne, useMemo } from '../../live';
import {
  useShader, useNoShader,
  useRawSource,
  useShaderRef,
  useTransformContext, useNoTransformContext,
  LineLayer,
} from '../../workbench';

import { useRangeContext } from '../providers/range-provider';

import { vec4 } from 'gl-matrix';

import { logarithmic, linear } from '../util/domain';

import { getGridPosition } from '../../wgsl/plot/gridwgsl';
import { getGridAutoState } from '../../wgsl/plot/grid-autowgsl';
import { getLineSegment } from '../../wgsl/geometry/segmentwgsl';

import {
  ColorTrait,
  GridTrait,
  LineTrait,
  ROPTrait,
  ScaleTrait,
} from '../traits';

const Traits = combine(
  ColorTrait,
  GridTrait,
  LineTrait,
  ROPTrait,
  trait({
    origin: parsePosition,
    auto: optional(parseBoolean),
  }),
);

const useScaleTrait = makeUseTrait(ScaleTrait);
const useTraits = makeUseTrait(Traits);

const NO_POINT4: XYZW = [0, 0, 0, 0];

type ScaleProps = TraitProps<typeof ScaleTrait>;

export type GridProps =
  TraitProps<typeof Traits>
& {
  //loop?: boolean,
  first?: Partial<ScaleProps> & { detail?: number },
  second?: Partial<ScaleProps> & { detail?: number },
};

const NO_SCALE_PROPS: Partial<ScaleProps> = {};

export const Grid: LiveComponent<GridProps> = memo((props) => {
  //const {loop} = props;
  const {
    axes, range,
    origin, auto,
    ...flags
  } = useTraits(props);

  const first = useScaleTrait(props.first ?? NO_SCALE_PROPS);
  const second = useScaleTrait(props.second ?? NO_SCALE_PROPS);

  const firstDetail = useProp(props.first?.detail, parseIntegerPositive);
  const secondDetail = useProp(props.second?.detail, parseIntegerPositive);

  const parentRange = useRangeContext();
  const transform = auto ? useTransformContext() : useNoTransformContext();

  const getGrid = (options: ScaleProps, detail: number, index: number, other: number) => {
    const main  = parseAxis(axes[index]);
    const cross = parseAxis(axes[other]);

    const r = range?.[index] ?? parentRange[main];
    const r2 = range?.[other] ?? parentRange[cross];

    const newValues = useMemo(() => {
      const f = (options.mode === 'log') ? logarithmic : linear;
      return new Float32Array(f(r[0], r[1], options));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [r[0], r[1], options]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const values = useMemo(() => newValues, newValues as any);

    const data = useRawSource(values, 'f32');
    const n = values.length * (detail + 1);

    const orig = vec4.clone(origin);
    const shift = vec4.clone(NO_POINT4);

    let autoBound: ShaderModule | null = null;
    if (auto) {
      orig.forEach((_, i) => {
        // Pin to minimum
        orig[i] = parentRange[i][0];

        if (i === main || i === cross) {
          shift[i] = 0;
        }
        else {
          shift[i] = parentRange[i][1] - parentRange[i][0];
        }
      });

      autoBound = useShader(getGridAutoState, [transform?.transform]);
    }
    else {
      useNoShader();
    }

    const min = vec4.clone(orig as any);
    min[main] = 0;
    min[cross] = r2[0];

    const max = vec4.clone(orig as any);
    max[main] = 0;
    max[cross] = r2[1];

    const m = useShaderRef(main);
    const m1 = useShaderRef(min);
    const m2 = useShaderRef(max);
    const s = useShaderRef(shift);

    const defines = useOne(() => ({ GRID_LINE_DETAIL: detail, GRID_AUTO: !!auto, SEGMENT_LINE_DETAIL: detail }), detail);
    const bound = useShader(getGridPosition, [data, m, m1, m2, s, autoBound], defines);

    // Expose position source
    const source = useMemo(() => ({
      shader: bound,
      length: n,
      size: [n],
      // n set below
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [bound]);

    const l = n * (auto ? 2 : 1);
    source.length = l;
    source.size[0] = l;

    return source;
  };

  const firstPositions = getGrid(first as any, firstDetail, 0, 1);
  const secondPositions = getGrid(second as any, secondDetail, 1, 0);

  // const firstLoop = loop || props.first?.loop;
  // const secondLoop = loop || props.second?.loop;

  return useMemo(() => (
    fragment([
      props.first !== null ? use(LineLayer, {
        positions: firstPositions,
        segments: getLineSegment,
        ...flags,
      }) : null,
      props.second !== null ? use(LineLayer, {
        positions: secondPositions,
        segments: getLineSegment,
        ...flags,
      }) : null,
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [firstPositions, secondPositions, auto, props, ...Object.values(flags)]);
}, shouldEqual({
  first: sameShallow(),
  second: sameShallow(),
}), 'Grid');
