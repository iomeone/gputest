import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ElementType, TensorArray, VectorLike, Emitter, UniformType } from '@use-gpu/core';

import { provide, yeet, memo, useOne, useMemo, useNoMemo } from '@use-gpu/live';
import {
  seq,
  makeTensorArray,
  makeNumberReader, makeNumberWriter, makeNumberSplitter,
  emitArray, emitMultiArray,
  toCPUDims,
  updateTensor,
} from '@use-gpu/core';
import { shouldEqual, sameShallow } from '@use-gpu/traits/live';
import {
  useTimeContext, useNoTimeContext,
  useAnimationFrame, useNoAnimationFrame,
  useBufferedSize, getRenderFunc,
} from '@use-gpu/workbench';

import { useDataContext, DataContext } from '../providers/data-provider';
import zipObject from 'lodash/zipObject.js';

export type TensorProps<S extends string | string[]> = {
  /** Input size up to [width, height, depth, layers] */
  size?: number[],
  /** Shorthand for size=[length] */
  length?: number,

  /** WGSL type per sample */
  format?: string,

  /** Input data */
  data?: VectorLike,
  /** Input emitter expression */
  expr?: Emitter,
  /** Emit N items per `expr` call. Output size is `[items, ...size]` if > 1. */
  items?: number,
  /** Emit 0 or N items per `expr` call. Output size is `[emitted]` or `[items, emitted]`. */
  sparse?: boolean,
  /** Add current `TimeContext` to the `expr` arguments. */
  time?: boolean,
  /** Resample `data` or `expr` on every animation frame. */
  live?: boolean,

  /** Inject into DataContext under this key(s) */
  as?: S,

  /** Omit to provide data context instead. */
  render?: S extends any[] ? (data: Record<ElementType<S>, TensorArray>) => LiveElement : (data: TensorArray) => LiveElement,
  children?: LiveElement | (S extends any[] ? (data: Record<ElementType<S>, TensorArray>) => LiveElement : (data: TensorArray) => LiveElement),
};

/** Sample up-to-4D array of a WGSL type. Reads input `data` or samples a given `expr`. */
export const Tensor: LiveComponent<TensorProps<unknown & (string | string[])>> = memo(<S extends string | string[]>(props: TensorProps<S>) => {
  const {
    format = 'f32',
    length: l = 0,
    size = [l],
    data,
    expr,
    children,
    as = 'positions',
    sparse = false,
    live = false,
    time = false,
  } = props;

  const items = Math.max(1, Math.round(props.items || 0));

  const count = size.reduce((a, b) => a * b, 1);
  const alloc = useBufferedSize(count);
  const length = items * count;
  const split = Array.isArray(as) ? as.length : 0;

  // Make tensor array
  const f = format as UniformType;
  const tensors = useMemo(
    () => split
      ? seq(items).map(() => makeTensorArray(f, alloc))
      : [makeTensorArray(f, items * alloc)],
    [f, alloc, items]
  );
  const arrays = useOne(() => tensors.map(({array}) => array), tensors);

  // Provide time for expr
  const clock = time && expr ? useTimeContext() : useNoTimeContext();

  // Refresh data
  const refresh = () => {
    const [tensor] = tensors;
    const {array, dims} = tensor;
    const d = toCPUDims(dims);

    let emitted = 0;
    const emit = split ? makeNumberSplitter(arrays, d) : makeNumberWriter(array, d);
    if (data) {
      const expr = makeNumberReader(data, d);
      emitted = emitArray(expr, emit, count);
    }
    else if (expr) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      emitted = emitMultiArray(expr, emit, count, size, clock!);
    }

    const l = !sparse ? length : emitted;
    const s = !sparse ? size : [emitted / items];

    if (split) {
      for (const t of tensors) updateTensor(t, l, s);
      return zipObject(as, tensors);
    }

    if (items > 1) updateTensor(tensor, l * items, [items, ...s]);
    else updateTensor(tensor, l, s);

    return {...tensor};
  };

  let value: TensorArray | Record<string, TensorArray>;
  if (!live) {
    useNoAnimationFrame();
    value = useMemo(refresh, [tensors, data, expr, items, sparse, ...size]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    value = refresh();
  }

  const render = getRenderFunc(props);

  const dataContext = useDataContext();

  const context = !render && children ? useMemo(
    () => split
      ? ({...dataContext, ...value})
      : ({...dataContext, [as as string]: value}),
    [dataContext, value, as]) : useNoMemo();

  return render ? render(value as any) : children ? provide(DataContext, context, children) : yeet(value);
}, shouldEqual({
  size: sameShallow(),
  range: sameShallow(sameShallow()),
  origin: sameShallow(),
}), 'Tensor');
