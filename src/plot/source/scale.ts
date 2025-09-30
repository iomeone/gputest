import type { LiveComponent, LiveElement } from '../../live';
import type { TensorArray } from '../../core';
import type { TraitProps } from '../../traits';

import { makeUseTrait, combine, trait, shouldEqual, sameShallow } from '../../traits/index-live';
import { parsePosition } from '../../parse';
import { memo, yeet, provide, useMemo, useNoMemo } from '../../live';
import { toTensorArray, fillNumberArray } from '../../core';
import { getRenderFunc } from '../../workbench';

import { useDataContext, DataContext } from '../providers/data-provider';
import { useRangeContext } from '../providers/range-provider';

import { logarithmic, linear } from '../util/domain';

import {
  ScaleTrait,
  AxisTrait,
} from '../traits';

const Traits = combine(
  ScaleTrait,
  AxisTrait,
  trait({
    origin: parsePosition,
  }),
);

const useTraits = makeUseTrait(Traits);

export type ScaleProps = TraitProps<typeof Traits> & {
  /** Omit to provide data context `positions` and `values` instead. */
  render?: (data: {positions: TensorArray, values: TensorArray}) => LiveElement,
  children?: LiveElement | ((data: {positions: TensorArray, values: TensorArray}) => LiveElement),
};

export const Scale: LiveComponent<ScaleProps> = memo((props: ScaleProps) => {

  const {
    children,
  } = props;

  const {axis, range, origin, ...domainOptions} = useTraits(props);

  const parentRange = useRangeContext();
  const r = range ?? parentRange[axis];

  // Generate value scale
  const values = useMemo(() => {
    const f = (props.mode === 'log') ? logarithmic : linear;
    return toTensorArray('f32', new Float32Array(f(r[0], r[1], domainOptions)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r[0], r[1], props]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const version = useMemo(() => [], [...values.array]);

  // Generate positions aligned with origin
  const n = values.length;
  const positions = useMemo(() => {
    const vs = values.array;
    const array = new Float32Array(n * 4);
    fillNumberArray(origin, array, 4, 4, 0, 0, n);
    for (let i = 0; i < n; ++i) array[i * 4 + axis] = vs[i];
    return toTensorArray('vec4<f32>', array);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, origin]);

  const render = getRenderFunc(props);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tensors = useMemo(() => ({positions, values}), [positions, version]);

  const dataContext = useDataContext();
  const context = !render && children ? useMemo(() => ({
    ...dataContext,
    ...tensors,
  }), [dataContext, tensors]) : (useNoMemo(), undefined);

  return render ? render(tensors) : (context && children) ? provide(DataContext, context, children) : yeet(tensors);
}, shouldEqual({
  origin: sameShallow(),
  range: sameShallow(sameShallow()),
}), 'Scale');
