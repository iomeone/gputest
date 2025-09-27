import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Emitter } from '@use-gpu/core/types';

import { provide, yeet, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataEmitter, makeDataArray, copyNumberArray, emitIntoMultiNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type SampledDataProps = {
  range: [number, number][],
  size: number[],

  centered?: boolean[] | boolean,
  expr?: (emit: Emitter, ...args: number[]) => void,
  items?: number,

  format?: string,
  live?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
};

export const SampledData: LiveComponent<SampledDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    range,
    format,
    size,
    data,
    expr,
    items = 1,
    render,
    children,
    centered = false,
    live = false,
  } = props;

  const length = size.length ? (items * size.reduce((a, b) => a * b, 1)) : (data?.length || 1);
  const l = useBufferedSize(length);
  const t = Math.max(1, Math.round(items) || 0);

  // Make data buffer
  const [buffer, array, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_DIMS)) ? format as UniformType : UniformType.f32;

    const {array, dims} = makeDataArray(f, l || 1);
    if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

    const buffer = makeStorageBuffer(device, array.byteLength);
    const source = {
      buffer,
      format: f,
      length: 0,
      size: undefined,
      version: 0,
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, l]);

  // Refresh and upload data
  const refresh = () => {
    if (data) copyNumberArray(data, array);
    if (expr && size.length) {
      const n = size.length;
      let sampled;
      if (n === 1) {
        const [min, max] = range[0];
        const step = (max - min) / size[0];
        sampled = (emit: Emitter, i: number, n: number) =>
          expr(emit, min + i * step, n);
      }
      else if (n === 2) {
        const [minX, maxX] = range[0];
        const [minY, maxY] = range[1];
        const stepX = (maxX - minX) / size[0];
        const stepY = (maxY - minY) / size[1];
        sampled = (emit: Emitter, i: number, j: number) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            size,
          );
      }
      else if (n === 3) {
        const [minX, maxX] = range[0];
        const [minY, maxY] = range[1];
        const [minZ, maxZ] = range[2];
        const stepX = (maxX - minX) / size[0];
        const stepY = (maxY - minY) / size[1];
        const stepZ = (maxZ - minZ) / size[2];
        sampled = (emit: Emitter, i: number, j: number, k: number) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            size,
          );
      }
      else if (n === 4) {
        const [minX, maxX] = range[0];
        const [minY, maxY] = range[1];
        const [minZ, maxZ] = range[2];
        const [minW, maxW] = range[3];
        const stepX = (maxX - minX) / size[0];
        const stepY = (maxY - minY) / size[1];
        const stepZ = (maxZ - minZ) / size[2];
        const stepW = (maxW - minW) / size[3];
        sampled = (emit: Emitter, i: number, j: number, k: number, l: number) =>
          expr(
            emit,
            minX + i * stepX,
            minY + j * stepY,
            minZ + k * stepZ,
            minW + l * stepW,
            size,
          );
      }
      else {
        throw new Error("Cannot sample across more than 4 dimensions");
      }

      if (sampled) emitIntoMultiNumberArray(sampled, array, dims, size, t);
    }
    if (data || expr) {
      uploadBuffer(device, buffer, array.buffer);
    }

    source.length = length;
    source.size = items > 1 ? [items, ...size] : size;
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, data, expr, dims, length, items, range]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  return useMemo(() => {
    if (render == null && children === undefined) return yeet(source);
    return render != null ? render(source) : children;
  }, [render, children, source]);
};
