import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, Accessor, DataField, DataBounds, ChunkLayout } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { yeet, extend, signal, gather, useOne, useMemo, useNoMemo, useContext, useNoContext, useYolo, incrementVersion } from '@use-gpu/live';
import {
  makePackedLayout,
  
  makeDataArray, makeDataAccessor,
  copyDataArray, copyNumberArray,
  copyDataArrays, copyNumberArrays,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrayChunked, copyNumberArrayChunked,
  getChunkCount,
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
  getBoundingBox, toDataBounds,
} from '@use-gpu/core';

export type InterleavedDataProps = {
  /** Input data, array of structs of values/arrays */
  data?: TypedArray,
  /** WGSL schema of input data */
  fields?: [UniformType, string][],
  /** Resample `data` on every animation frame. */
  live?: boolean,

  /** Per item `isLoop` accessor */
  loop?: <T>(t: T[]) => boolean,
  /** Per item `hasStart` accessor */
  start?: <T>(t: T[]) => boolean,
  /** Per item `hasEnd` accessor */
  end?: <T>(t: T[]) => boolean,
  
  /** Segment decorator(s) */
  on?: LiveElement,

  /** Receive 1 source per field, in struct-of-array format. Leave empty to yeet sources instead. */
  render?: (...sources: StorageSource[]) => LiveElement,
};

const NO_FIELDS = [] as [UniformType, string][];
const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** Convert an interleaved, flat array-of-structs with fields `T` into struct-of-array data. */
export const InterleavedData: LiveComponent<InterleavedDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    fields,
    render,
    live = false,
  } = props;

  const fs = fields ?? NO_FIELDS;
  const typedArray = useOne(() => Array.isArray(data) ? new Float32Array(data) : data ?? new Float32Array(256), data);

  // Gather data layout/length
  const {layout, dataCount, dataStride, bytesPerElement} = useMemo(() => {
    
    const uniforms = fs.map(([format, name]) => ({name, format}));

    const {length, byteLength, BYTES_PER_ELEMENT} = typedArray;
    const layout = makePackedLayout(uniforms);

    const dataCount = byteLength / layout.length;
    const dataStride = layout.length / BYTES_PER_ELEMENT;
    const bytesPerElement = BYTES_PER_ELEMENT;

    return {layout, dataCount, dataStride, bytesPerElement};
  }, [typedArray, fs]);
  
  const bufferLength = useBufferedSize(dataCount);

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {

    const fieldBuffers = fs.map(([format], i) => {
      if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      const {array, dims} = makeDataArray(f, bufferLength);

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
        bounds: {...NO_BOUNDS},
      };

      const offset = layout.attributes[i].offset / bytesPerElement;
      if (offset !== Math.round(offset)) throw new Error(`Misaligned field "${format}" for typed array "${typedArray}"`);

      return {buffer, array, source, dims, offset};
    });

    const fieldSources = fieldBuffers.map(f => f.source);

    return [fieldBuffers, fieldSources];
  }, [device, fs, bufferLength, layout]);
  
  // Refresh and upload data
  const refresh = () => {
    if (!typedArray) return;

    for (const {buffer, array, source, dims, offset} of fieldBuffers) {

      let src = offset;
      let dst = 0;
      for (let i = 0; i < dataCount; ++i, src += dataStride) {
        let p = src;
        for (let j = 0; j < dims; ++j) array[dst++] = typedArray[p++];
      }

      uploadBuffer(device, buffer, array.buffer);

      source.length  = dataCount;
      source.size[0] = source.length;
      source.version = incrementVersion(source.version);

      const {bounds} = source;
      const {center, radius, min, max} = toDataBounds(getBoundingBox(array, Math.ceil(dims)));
      bounds.center = center;
      bounds.radius = radius;
      bounds.min = min;
      bounds.max = max;
    }
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, data, fieldBuffers, dataCount]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh()
  }

  const trigger = useOne(() => signal(), fieldSources[0]?.version);

  const view = useYolo(() => render ? render(...fieldSources) : yeet(fieldSources), [render, fieldSources]);
  return [trigger, view];
};
