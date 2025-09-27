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

export type ArrayDataProps = {
  size: number[],
  data?: number[] | TypedArray,
  expr?: (emit: Emitter, ...args: number[]) => void,
  items?: number,
  format?: string,
  live?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
};

export const ArrayData: LiveComponent<ArrayDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    format,
    size,
    data,
    expr,
    items = 1,
    render,
    children,
    live = false,
  } = props;

  const length = size.length ? size.reduce((a, b) => a * b, 1) : [data?.length || 1];
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
      length,
      size,
      version: 0,
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, l]);

  // Refresh and upload data
  const refresh = () => {
    if (data) copyNumberArray(data, array);
    if (expr && size.length) {
      emitIntoMultiNumberArray(expr, array, dims, size, t);
    }
    if (data || expr) {
      uploadBuffer(device, buffer, array.buffer);
    }

    source.length = length;
    source.size = size;
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, data, expr, dims, length, items]);
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
