import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Accessor, DataField } from '@use-gpu/core/types';

import { yeet, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, makeDataAccessor, copyDataArray, copyNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type DataProps = {
  length?: number,
  data?: any[],
  fields?: DataField[],
  live?: boolean,

  render?: (sources: StorageSource[]) => LiveElement<any>,
};

const NO_FIELDS = [] as DataField[];

export const Data: LiveComponent<DataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    fields,
    render,
    live = false,
  } = props;

  const length = data?.length || fields?.[0]?.[1]?.length;
  const l = useBufferedSize(length || 1);
  const fs = fields ?? NO_FIELDS;

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {
    const fieldBuffers = fs.map(([format, accessor]) => {
      if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, length, fn} = makeDataAccessor(f, accessor);
      if (length == null) length = l;

      const {array, dims} = makeDataArray(f, length);
      if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
      };

      return {buffer, array, source, dims, accessor, raw};
    });
    const fieldSources = fieldBuffers.map(f => f.source);
    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);

  // Refresh and upload data
  const refresh = () => {
    for (const {buffer, array, source, dims, accessor, raw} of fieldBuffers) if (raw || data) {
      if (raw) copyNumberArray(raw, array);
      else if (data) copyDataArray(data, array, dims, accessor as Accessor);

      uploadBuffer(device, buffer, array.buffer);

      source.length = length;
      source.size[0] = length;
      source.version = incrementVersion(source.version);
    }
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, data, fieldBuffers, length]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  return useMemo(() => render ? render(fieldSources) : yeet(fieldSources), [render, fieldSources]);
};
