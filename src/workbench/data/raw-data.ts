import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, LambdaSource, TypedArray, UniformType, Emit, Emitter, Time, DataBounds } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { provide, yeet, signal, useMemo, useNoMemo, useOne, useNoOne, useContext, useNoContext, useYolo, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, copyNumberArray, emitIntoNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
  getBoundingBox, toDataBounds,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useTimeContext, useNoTimeContext } from '../providers/time-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { useBoundSource, useNoBoundSource } from '../hooks/useBoundSource';
import { getBoundShader } from '../hooks/useBoundShader';

import { chainTo } from '@use-gpu/shader/wgsl';
import { getIndex } from '@use-gpu/wgsl/instance/interleave.wgsl';

const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

export type RawDataProps = {
  /** Set/override input length */
  length?: number,

  /** WGSL format per sample */
  format?: string,
  
  /** Input data */
  data?: number[] | TypedArray,
  /** Input emitter expression */
  expr?: Emitter<Time>,
  /** Emit N items per expr call. Output size is `[items, N]` if items > 1. */
  items?: number,
  /** Emit 0 or N items per expr call. Output size is `[N]` or `[items, N]`. */
  sparse?: boolean,
  /** Resample `data` on every animation frame. */
  live?: boolean,
  /** Add current `TimeContext` to the `expr` arguments. */
  time?: boolean,

  /** Split output into 1 source per item. */
  interleaved?: boolean,

  /** Leave empty to yeet source(s) instead. */
  render?: (...source: ShaderSource[]) => LiveElement,
};

const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** 1D array of a WGSL type. Reads input `data` or samples a given `expr` of WGSL type `format`. */
export const RawData: LiveComponent<RawDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    format, length,
    data, expr,
    render,
    items = 1,
    interleaved = false,
    sparse = false,
    live = false,
    time = false,
  } = props;

  const t = Math.max(1, Math.round(items) || 0);
  const count = t * (length ?? (data?.length || 0));
  const l = useBufferedSize(count);

  // Make data buffer
  const [buffer, array, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_ARRAY_DIMS)) ? format as UniformType : 'f32';

    const {array, dims} = makeDataArray(f, l || 1);

    const buffer = makeStorageBuffer(device, array.byteLength);
    const source = {
      buffer,
      format: f,
      length: 0,
      size: [0],
      version: 0,
      bounds: {...NO_BOUNDS},
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, l]);

  // Make de-interleaving shader
  let sources: LambdaSource[] | undefined;
  if (interleaved) {
    const binding = useOne(() => ({name: 'getData', format: format as any as UniformType}), format);
    const getData = useBoundSource(binding, source);
    sources = useMemo(() => (
      seq(t).map(i => ({
        shader: chainTo(getBoundShader(getIndex, [i, t]), getData),
        length: 0,
        size: [0],
        version: 0,
        bounds: source.bounds,
      }))
    ), [t, getData]);
  }
  else {
    useNoOne();
    useNoBoundSource();
    useNoMemo();
  }

  // Provide time for expr
  const clock = time && expr ? useTimeContext() : useNoTimeContext();

  // Refresh and upload data
  const refresh = () => {
    let emitted = 0;

    if (data) copyNumberArray(data, array, dims);
    if (expr) emitted = emitIntoNumberArray(expr, array, dims, clock!);
    if (data || expr) {
      uploadBuffer(device, buffer, array.buffer);
    }

    source.length  = !sparse ? count : emitted;
    source.size    = !sparse ? (items > 1 ? [items, count] : [count]) : [items, emitted / items];
    source.version = incrementVersion(source.version);

    const {bounds} = source;
    const {center, radius, min, max} = toDataBounds(getBoundingBox(array, Math.ceil(dims)));
    bounds!.center = center;
    bounds!.radius = radius;
    bounds!.min = min;
    bounds!.max = max;

    if (sources) {
      for (const s of sources) {
        s.length  = source.length / t;
        s.size    = source.size.slice(1);
        s.version = source.version;
      }
    }
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, buffer, array, data, expr, count, dims]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  const trigger = useOne(() => signal(), source.version);
  const view = sources
    ? useYolo(() => render ? render(...sources!) : yeet(sources!), [render, sources])
    : useYolo(() => render ? render(source) : yeet(source), [render, source]);
  return [trigger, view];
};
