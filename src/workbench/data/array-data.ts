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

export type ArrayDataProps = {
  size: number[],

  sparse?: boolean,
  data?: number[] | TypedArray,
  expr?: Emitter,
  items?: number,

  format?: string,
  live?: boolean,
  time?: boolean,

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
    sparse = false,
    live = false,
    time = false,
  } = props;

  const t = Math.max(1, Math.round(items) || 0);

  const length = t * (size.length ? size.reduce((a, b) => a * b, 1) : (data?.length || 0));
  const l = useBufferedSize(length);

  // Make data buffer
  const [buffer, array, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_ARRAY_DIMS)) ? format as UniformType : 'f32';

    const {array, dims} = makeDataArray(f, l || 1);

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

  // Provide time for expr
  const clock = time && expr ? useTimeContext() : useNoTimeContext();

  // Refresh and upload data
  const refresh = () => {
    let emitted = 0;
    if (data) copyNumberArray(data, array, dims);
    if (expr && size.length) {
      emitted = emitIntoMultiNumberArray(expr, array, dims, size, clock!);
    }
    if (data || expr) {
      uploadBuffer(device, buffer, array.buffer);
    }

    source.length  = !sparse ? length : emitted;
    source.size    = !sparse ? (items > 1 ? [items, ...size] : size) : [items, emitted / items];
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
    return render ? render(source) : yeet(source);
  }, [render, source]);
};
