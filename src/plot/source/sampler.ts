import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ElementType, TensorArray, VectorLike, Emit, Emitter, UniformType } from '@use-gpu/core';

import { provide, yeet, deprecated, memo, useOne, useMemo, useNoMemo } from '@use-gpu/live';
import {
  seq, makeTensorArray, emitMultiArray, makeNumberWriter, makeNumberSplitter, updateTensor,
} from '@use-gpu/core';
import { parseAxis, parseVec4 } from '@use-gpu/parse';
import { optional, useProp, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import {
  useTimeContext, useNoTimeContext,
  useAnimationFrame, useNoAnimationFrame,
  useBufferedSize, getRenderFunc,
} from '@use-gpu/workbench';

import { useRangeContext, useNoRangeContext } from '../providers/range-provider';
import { useDataContext, DataContext } from '../providers/data-provider';
import zipObject from 'lodash/zipObject.js';

export type SamplerProps<S extends string | string[]> = {
  /** Sample count up to [width, height, depth, layers] */
  size?: number[],
  /** Shorthand for size=[length] */
  length?: number,

  /** Axis to sample on (1D) */
  axis?: string,
  /** Axes to sample on (2D+) */
  axes?: string,
  /** Sample origin to maintain alignment to */
  origin?: VectorLike,

  /** WGSL type per sample */
  format?: string,

  /** Input emitter expression */
  expr?: Emitter,
  /** Input range to sample on each axis. Use RangeContext if omitted. */
  range?: [number, number][],
  /** Extra padding samples to add outside the input range. */
  padding?: number,
  /** Emit N items per `expr` call. Output size is `[items, ...size]` if > 1. */
  items?: number,
  /** Emit 0 or N items per `expr` call. Output size is `[N]` or `[items, N]`. */
  sparse?: boolean,
  /** Use centered samples (0.5, 1.5, ..., N-0.5) instead of edge-to-edge samples (0, 1, ..., N). */
  centered?: boolean[] | boolean,
  /** Add current indices `i`, `j`, `k`, `l` to the `expr` arguments. */
  index?: boolean,
  /** Add current `TimeContext` to the `expr` arguments. */
  time?: boolean,
  /** Resample `data` or `expr` on every animation frame. */
  live?: boolean,

  /** Inject into DataContext under this key(s) */
  as?: S,

  /** Omit to provide data context instead. */
  render?: S extends any[] ? (data: Record<ElementType<S>, TensorArray>) => LiveElement : (data: TensorArray) => LiveElement,
  children?: LiveElement | ((S extends any[] ? (data: Record<ElementType<S>, TensorArray>) => LiveElement : (data: TensorArray) => LiveElement)),
};

/** Up-to-4D array of a WGSL type. Samples a given `expr` on the given `range`. */
export const Sampler: LiveComponent<SamplerProps<unknown & (string | string[])>> = memo(<S extends string | string[]>(props: SamplerProps<S>) => {
  const {
    axis,
    axes = 'xyzw',
    format = 'f32',
    length: l = 0,
    size = [l],
    expr,
    children,
    as = 'positions',
    padding = 0,
    sparse = false,
    centered = false,
    live = false,
    index = false,
    time = false,
  } = props;

  const parentRange = props.range ? (useNoRangeContext(), props.range) : useRangeContext();
  const items = Math.max(1, Math.round(props.items || 0));
  const origin = useProp(props.origin, optional(parseVec4));

  const a = axis ?? axes;
  const range = useMemo(() => {
    const basis = a.split('').map(parseAxis);
    return basis.map(i => parentRange[i]);
  }, [parentRange, a]);

  const border = padding + +!!origin;
  const padded = size.map(n => n + border * 2);

  const count = padded.reduce((a, b) => a * b, 1);
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
  const {dims} = tensors[0];

  const clock = time ? useTimeContext() : useNoTimeContext();

  const [sampled, emit] = useMemo(() => {
    if (!size.length || !expr) return [null, null];

    const n = size.length;
    let sampled: Emitter<any>;
    if (n === 1) {
      const c = +!!(centered === true || (centered as any)[0]);
      // eslint-disable-next-line prefer-const
      let [min, max] = range[0];
      const step = (max - min) / (size[0] - 1 + c);
      const align = origin ? (min - origin[0]) % step : 0;
      if (c) min += step / 2;
      min -= step * border + align;

      if (index) {
        sampled = (<T>(emit: Emit, i: number, t: T) =>
          expr(emit, min + i * step, i - border, t)) as any;
      }
      else {
        sampled = (<T>(emit: Emit, i: number, t: T) =>
          expr(emit, min + i * step, t)) as any;
      }
    }
    else if (n === 2) {
      const cx = +!!(centered === true || (centered as any)[0]);
      const cy = +!!(centered === true || (centered as any)[1]);

      // eslint-disable-next-line prefer-const
      let [minX, maxX] = range[0];
      // eslint-disable-next-line prefer-const
      let [minY, maxY] = range[1];
      const stepX = (maxX - minX) / (size[0] - 1 + cx);
      const stepY = (maxY - minY) / (size[1] - 1 + cy);
      const alignX = origin ? (minX - origin[0]) % stepX : 0;
      const alignY = origin ? (minY - origin[1]) % stepY : 0;
      if (cx) minX += stepX / 2;
      if (cy) minY += stepY / 2;
      minX -= stepX * border + alignX;
      minY -= stepY * border + alignY;

      if (index) {
        sampled = (<T>(emit: Emit, i: number, j: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            i - border,
            j - border,
            t,
          )) as any;
      }
      else {
        sampled = (<T>(emit: Emit, i: number, j: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            t,
          )) as any;
      }
    }
    else if (n === 3) {
      const cx = +!!(centered === true || (centered as any)[0]);
      const cy = +!!(centered === true || (centered as any)[1]);
      const cz = +!!(centered === true || (centered as any)[2]);

      // eslint-disable-next-line prefer-const
      let [minX, maxX] = range[0];
      // eslint-disable-next-line prefer-const
      let [minY, maxY] = range[1];
      // eslint-disable-next-line prefer-const
      let [minZ, maxZ] = range[2];
      const stepX = (maxX - minX) / (size[0] - 1 + cx);
      const stepY = (maxY - minY) / (size[1] - 1 + cy);
      const stepZ = (maxZ - minZ) / (size[2] - 1 + cz);
      const alignX = origin ? (minX - origin[0]) % stepX : 0;
      const alignY = origin ? (minY - origin[1]) % stepY : 0;
      const alignZ = origin ? (minZ - origin[2]) % stepZ : 0;
      if (cx) minX += stepX / 2;
      if (cy) minY += stepY / 2;
      if (cz) minZ += stepZ / 2;
      minX -= stepX * border + alignX;
      minY -= stepY * border + alignY;
      minZ -= stepZ * border + alignZ;

      if (index) {
        sampled = (<T>(emit: Emit, i: number, j: number, k: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            i - border,
            j - border,
            k - border,
            t,
          )) as any;
      }
      else {
        sampled = (<T>(emit: Emit, i: number, j: number, k: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            t,
          )) as any;
      }
    }
    else if (n === 4) {
      const cx = +!!(centered === true || (centered as any)[0]);
      const cy = +!!(centered === true || (centered as any)[1]);
      const cz = +!!(centered === true || (centered as any)[2]);
      const cw = +!!(centered === true || (centered as any)[3]);

      // eslint-disable-next-line prefer-const
      let [minX, maxX] = range[0];
      // eslint-disable-next-line prefer-const
      let [minY, maxY] = range[1];
      // eslint-disable-next-line prefer-const
      let [minZ, maxZ] = range[2];
      // eslint-disable-next-line prefer-const
      let [minW, maxW] = range[3];
      const stepX = (maxX - minX) / (size[0] - 1 + cx);
      const stepY = (maxY - minY) / (size[1] - 1 + cy);
      const stepZ = (maxZ - minZ) / (size[2] - 1 + cz);
      const stepW = (maxW - minW) / (size[3] - 1 + cw);
      const alignX = origin ? (minX - origin[0]) % stepX : 0;
      const alignY = origin ? (minY - origin[1]) % stepY : 0;
      const alignZ = origin ? (minZ - origin[2]) % stepZ : 0;
      const alignW = origin ? (minW - origin[3]) % stepW : 0;
      if (cx) minX += stepX / 2;
      if (cy) minY += stepY / 2;
      if (cz) minZ += stepZ / 2;
      if (cw) minW += stepW / 2;
      minX -= stepX * border + alignX;
      minY -= stepY * border + alignY;
      minZ -= stepZ * border + alignZ;
      minW -= stepW * border + alignW;

      if (index) {
        sampled = (<T>(emit: Emit, i: number, j: number, k: number, l: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            minW + l * stepW,
            i - border,
            j - border,
            k - border,
            l - border,
            t,
          )) as any;
      }
      else {
        sampled = (<T>(emit: Emit, i: number, j: number, k: number, l: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            minW + l * stepW,
            t,
          )) as any;
      }
    }
    else {
      throw new Error("Cannot sample across more than 4 dimensions");
    }

    const emit = split ? makeNumberSplitter(arrays, dims) : makeNumberWriter(arrays[0], dims);
    return [sampled, emit];
  }, [centered, range, size, border, arrays, dims]);

  const refresh = () => {
    const [tensor] = tensors;

    emit?.reset();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const emitted = sampled ? emitMultiArray(sampled, emit, count, padded, clock!) : 0;

    const l = !sparse ? length : emitted;
    const s = !sparse ? padded : [emitted / items];

    if (split) {
      for (const t of tensors) updateTensor(t, l, s);
      return zipObject(as, tensors.map(t => ({...t})));
    }

    if (items > 1) updateTensor(tensor, l * items, [items, ...s]);
    else updateTensor(tensor, l, s);

    return {...tensor};
  };

  let value: TensorArray | Record<string, TensorArray>;
  if (!live) {
    useNoAnimationFrame();
    value = useMemo(refresh, [tensors, expr, centered, border, origin, range, items, sparse, ...size]);
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
}), 'Sampler');

export const Sampled = deprecated(Sampler, 'Sampled');
