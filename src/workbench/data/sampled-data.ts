import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, Emit, Emitter } from '@use-gpu/core';

import { provide, yeet, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, copyNumberArray, emitIntoMultiNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useTimeContext, useNoTimeContext } from '../providers/time-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type SampledDataProps = {
  range: [number, number][],
  size: number[],

  sparse?: boolean,
  centered?: boolean[] | boolean,
  expr?: Emitter,
  items?: number,

  format?: string,
  live?: boolean,
  time?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
};

export const SampledData: LiveComponent<SampledDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    range,
    format,
    size,
    expr,
    items = 1,
    render,
    sparse = false,
    centered = false,
    live = false,
    time = false,
  } = props;

  const t = Math.max(1, Math.round(items) || 0);
  const length = t * (size.length ? size.reduce((a, b) => a * b, 1) : 1);
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

        sampled = (<T>(emit: Emit, i: number, n: number, t: T) =>
          expr(emit, min + i * step, i, t)) as any;
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

        sampled = (<T>(emit: Emit, i: number, j: number, w: number, h: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            i,
            j,
            t,
          )) as any;
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

        sampled = (<T>(emit: Emit, i: number, j: number, k: number, w: number, h: number, d: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            i,
            j,
            k,
            t,
          )) as any;
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

        sampled = (<T>(emit: Emit, i: number, j: number, k: number, l: number, w: number, h: number, d: number, q: number, t: T) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            minW + l * stepW,
            i,
            j,
            k,
            l,
            t,
          )) as any;
      }
      else {
        throw new Error("Cannot sample across more than 4 dimensions");
      }

      if (sampled) {
        emitted = emitIntoMultiNumberArray(sampled, array, dims, size, clock!);
      }
    }
    if (expr) {
      uploadBuffer(device, buffer, array.buffer);
    }

    source.length  = !sparse ? length : emitted;
    source.size    = !sparse ? (items > 1 ? [items, ...size] : size) : [items, emitted / items];
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, expr, dims, length, items, range]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  return useMemo(() => {
    return render ? render(source) : yeet(source);
  }, [render, source]);
};
