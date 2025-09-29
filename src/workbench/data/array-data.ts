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

export type ArrayDataProps = {
  /** Input size up to [width, height, depth, layers] */
  size: number[],

  /** WGSL type per sample */
  format?: string,

  /** Input data */
  data?: number[] | TypedArray,
  /** Input emitter expression */
  expr?: Emitter,
  /** Emit N items per `expr` call. Output size is `[items, ...size]` if > 1. */
  items?: number,
  /** Emit 0 or N items per `expr` call. Output size is `[N]` or `[items, N]`. */
  sparse?: boolean,
  /** Add current `TimeContext` to the `expr` arguments. */
  time?: boolean,
  /** Resample `data` or `expr` on every animation frame. */
  live?: boolean,

  /** Leave empty to yeet source instead. */
  render?: (source: StorageSource) => LiveElement,
};

const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** Up-to-4D array of a WGSL type. Reads input `data` or samples a given `expr`. */
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
      bounds: {...NO_BOUNDS},
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
      source.version = incrementVersion(source.version);
    }

    source.length  = !sparse ? length : emitted;
    source.size    = !sparse ? (items > 1 ? [items, ...size] : size) : [items, emitted / items];

    const {bounds} = source;
    const {center, radius, min, max} = toDataBounds(getBoundingBox(array, Math.ceil(dims)));
    bounds!.center = center;
    bounds!.radius = radius;
    bounds!.min = min;
    bounds!.max = max;
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, data, expr, dims, length, items]);
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
