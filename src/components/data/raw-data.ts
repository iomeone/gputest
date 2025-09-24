import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Emitter } from '@use-gpu/core/types';
import { DeviceContext, FrameContext } from '../providers';
import { yeet, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataEmitter, makeDataArray, copyNumberArray, emitIntoNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '@use-gpu/core';

export type RawDataProps = {
  length?: number,
  data?: number[] | TypedArray,
  expr?: (emit: Emitter, i: number, n: number) => void,
  format?: string,
  live?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
};

export const RawData: LiveComponent<RawDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    format, length,
    data, expr,
    render,
    live = false,
  } = props;

  // Make data buffer
  const [buffer, array, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_DIMS)) ? format as UniformType : UniformType.f32;
    const l = length ?? (data?.length || 0);

    const {array, dims} = makeDataArray(f, l || 1);
    if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

    const buffer = makeStorageBuffer(device, array.byteLength);
    const source = {
      buffer,
      format: f,
      length: l,
      version: 0,
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, length, live]);

  // Refresh and upload data
  const refresh = () => {
    if (data) copyNumberArray(data, array);
    if (expr) emitIntoNumberArray(expr, array, dims);
    if (data || expr) {
      uploadBuffer(device, buffer, array.buffer);
      source.version = incrementVersion(source.version);
    }
  };

  if (!live) {
    useNoContext(FrameContext);
    useMemo(refresh, [device, buffer, array, data, expr, dims]);
  }
  else {
    useContext(FrameContext);
    useNoMemo();
    refresh();
  }

  return useMemo(() => render ? render(source) : yeet(source), [render, source]);
};
