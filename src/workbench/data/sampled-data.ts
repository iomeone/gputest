import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { DataBounds, TypedArray, StorageSource, UniformType, Emit, Emitter } from '@use-gpu/core';

import { provide, yeet, signal, useOne, useMemo, useNoMemo, useContext, useNoContext, useYolo, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, copyNumberArray, emitIntoMultiNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
  getBoundingBox, toDataBounds,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useTimeContext, useNoTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type SampledDataProps = {
  /** Sample count up to [width, height, depth, layers] */
  size: number[],

  /** WGSL type per sample */
  format?: string,

  /** Input emitter expression */
  expr?: Emitter,
  /** Input range to sample on each axis */
  range: [number, number][],
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

  /** Leave empty to yeet source instead. */
  render?: (source: StorageSource) => LiveElement,
};

const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** Up-to-4D array of a WGSL type. Samples a given `expr` on the given `range`. */
export const SampledData: LiveComponent<SampledDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    range,
    format,
    size,
    expr,
    items = 1,
    render,
    padding = 0,
    sparse = false,
    centered = false,
    live = false,
    index = false,
    time = false,
  } = props;

  const t = Math.max(1, Math.round(items) || 0);
  const s = size.map(n => n + padding * 2);
  const length = t * (s.length ? s.reduce((a, b) => a * b, 1) : 1);
  const l = useBufferedSize(length);

  // Make data buffer
  const [buffer, array, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_ARRAY_DIMS)) ? format as UniformType : 'f32';

    const {array, dims} = makeDataArray(f, l || 1);
    if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

    const buffer = makeStorageBuffer(device, array.byteLength);
    const source = {
      buffer,
      format: f,
      length: 0,
      size: [],
      version: 0,
      bounds: {...NO_BOUNDS},
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, l]);

  const clock = time ? useTimeContext() : useNoTimeContext();

  // Refresh and upload data
  const refresh = () => {
    let emitted = 0;

    if (expr && size.length) {
      const n = size.length;
      let sampled: Emitter<any>;
      if (n === 1) {
        const c = +!!(centered === true || (centered as any)[0]);
        let [min, max] = range[0];
        let step = (max - min) / (size[0] - 1 + c);
        if (c) min += step / 2;
        min -= step * padding;

        if (index) {
          sampled = (<T>(emit: Emit, i: number, t: T) =>
            expr(emit, min + i * step, i - padding, t)) as any;
        }
        else {
          sampled = (<T>(emit: Emit, i: number, t: T) =>
            expr(emit, min + i * step, i - padding, t)) as any;
        }
      }
      else if (n === 2) {
        const cx = +!!(centered === true || (centered as any)[0]);
        const cy = +!!(centered === true || (centered as any)[1]);

        let [minX, maxX] = range[0];
        let [minY, maxY] = range[1];
        let stepX = (maxX - minX) / (size[0] - 1 + cx);
        let stepY = (maxY - minY) / (size[1] - 1 + cy);
        if (cx) minX += stepX / 2;
        if (cy) minY += stepY / 2;
        minX -= stepX * padding;
        minY -= stepY * padding;

        if (index) {
          sampled = (<T>(emit: Emit, i: number, j: number, t: T) =>
            expr(
              emit,
              minX + i * stepX,
              minY + j * stepY,
              i - padding,
              j - padding,
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

        let [minX, maxX] = range[0];
        let [minY, maxY] = range[1];
        let [minZ, maxZ] = range[2];
        let stepX = (maxX - minX) / (size[0] - 1 + cx);
        let stepY = (maxY - minY) / (size[1] - 1 + cy);
        let stepZ = (maxZ - minZ) / (size[2] - 1 + cz);
        if (cx) minX += stepX / 2;
        if (cy) minY += stepY / 2;
        if (cz) minZ += stepZ / 2;
        minX -= stepX * padding;
        minY -= stepY * padding;
        minZ -= stepZ * padding;

        if (index) {
          sampled = (<T>(emit: Emit, i: number, j: number, k: number, t: T) =>
            expr(
              emit,
              minX + i * stepX,
              minY + j * stepY,
              minZ + k * stepZ,
              i - padding,
              j - padding,
              k - padding,
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

        let [minX, maxX] = range[0];
        let [minY, maxY] = range[1];
        let [minZ, maxZ] = range[2];
        let [minW, maxW] = range[3];
        let stepX = (maxX - minX) / (size[0] - 1 + cx);
        let stepY = (maxY - minY) / (size[1] - 1 + cy);
        let stepZ = (maxZ - minZ) / (size[2] - 1 + cz);
        let stepW = (maxW - minW) / (size[3] - 1 + cw);
        if (cx) minX += stepX / 2;
        if (cy) minY += stepY / 2;
        if (cz) minZ += stepZ / 2;
        if (cw) minW += stepW / 2;
        minX -= stepX * padding;
        minY -= stepY * padding;
        minZ -= stepZ * padding;
        minW -= stepW * padding;

        if (index) {
          sampled = (<T>(emit: Emit, i: number, j: number, k: number, l: number, t: T) =>
            expr(
              emit,
              minX + i * stepX,
              minY + j * stepY,
              minZ + k * stepZ,
              minW + l * stepW,
              i - padding,
              j - padding,
              k - padding,
              l - padding,
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

      if (sampled) {
        emitted = emitIntoMultiNumberArray(sampled, array, dims, s, clock!);
      }
    }
    if (expr) {
      uploadBuffer(device, buffer, array.buffer);
      source.version = incrementVersion(source.version);
    }

    source.length  = !sparse ? length : emitted;
    source.size    = !sparse ? (items > 1 ? [items, ...s] : s) : [items, emitted / items];

    const {bounds} = source;
    const {center, radius, min, max} = toDataBounds(getBoundingBox(array, Math.ceil(dims)));
    bounds!.center = center;
    bounds!.radius = radius;
    bounds!.min = min;
    bounds!.max = max;
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, expr, dims, length, items, range]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  const trigger = useOne(() => signal(), source.version);
  const view = useYolo(() => render ? render(source) : yeet(source), [render, source]);
  return [trigger, view];
};
