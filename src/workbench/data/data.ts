import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, Accessor, DataField, DataBounds } from '@use-gpu/core';

import { yeet, signal, useOne, useMemo, useNoMemo, useContext, useNoContext, useYolo, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, makeDataAccessor, copyDataArray, copyNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
  getBoundingBox, toDataBounds,
} from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type DataProps = {
  /** Input data, array of structs */
  data?: any[],
  /** WGSL schema of input data */
  fields?: DataField[],
  /** Resample `data` on every animation frame. */
  live?: boolean,

  /** Receive 1 source per field, in struct-of-array format. Leave empty to yeet sources instead. */
  render?: (...sources: StorageSource[]) => LiveElement,
};

const NO_FIELDS = [] as DataField[];
const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** Compose array-of-structs into struct-of-array data. */
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
    const fieldBuffers = fs.map(([format, accessor, accessorType]) => {
      if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, length, fn} = makeDataAccessor(f, accessor);
      if (length == null) length = l;

      const {array, dims} = makeDataArray(f, length);

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
        bounds: {...NO_BOUNDS},
      };

      return {buffer, array, source, dims, accessor: fn, raw};
    });
    const fieldSources = fieldBuffers.map(f => f.source);
    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);

  // Refresh and upload data
  const refresh = () => {
    for (const {buffer, array, source, dims, accessor, raw} of fieldBuffers) if (raw || data) {
      if (raw) copyNumberArray(raw, array, dims);
      else if (data) copyDataArray(data, array, dims, accessor as Accessor);

      uploadBuffer(device, buffer, array.buffer);

      const length = raw ? array.length / dims : data ? data.length : 0;
      source.length  = length;
      source.size[0] = length;
      source.version = incrementVersion(source.version);

      const {bounds} = source;
      if (bounds) {
        const {center, radius, min, max} = toDataBounds(getBoundingBox(array, Math.ceil(dims)));
        bounds.center = center;
        bounds.radius = radius;
        bounds.min = min;
        bounds.max = max;
      }
    }
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, data, fieldBuffers, length]);
  }
  else {
    useAnimationFrame();
    refresh();
  }

  const trigger = useOne(() => signal(), fieldSources[0]?.version);
  const view = useYolo(() => render ? render(...fieldSources) : yeet(fieldSources), [render, fieldSources]);
  return [trigger, view];
};
