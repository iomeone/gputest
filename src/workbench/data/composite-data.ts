import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, Accessor, DataField, DataBounds, ChunkLayout } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { yeet, extend, signal, gather, useOne, useMemo, useNoMemo, useContext, useNoContext, useYolo, useNoYolo, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, makeDataAccessor,
  copyDataArray, copyNumberArray,
  copyDataArrays, copyNumberArrays,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrayChunked, copyNumberArrayChunked,
  getChunkCount,
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
  getBoundingBox, toDataBounds,
} from '@use-gpu/core';

export type CompositeDataProps = {
  /** Input data, array of structs of values/arrays */
  data?: (Record<string, any>)[],
  /** WGSL schema of input data */
  fields?: DataField[],
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

const NO_FIELDS = [] as DataField[];
const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

const isComposite = (format: string) => !!format.match(/^array</);
const toSimple = (format: string) => format.slice(6, -1);

const accumulate = (xs: number[]): number[] => {
  let out: number[] = [];
  let n = xs.length;
  let accum = 0;
  for (let i = 0; i < n; ++i) {
    out.push(accum);
    accum += xs[i];
  }
  return out;
}

const iterateChunks = (
  data: any[] | undefined,
  field: DataField,
  callback: (n: number, item?: any) => void,
) => {
  // Read out chunk lengths and cycle flag
  let [format, accessor] = field;
  format = toSimple(format);

  // Prepare format appropriate accessor
  if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
  const f = format as any as UniformType;
  const dims = UNIFORM_ARRAY_DIMS[f];

  let {raw, length: l, fn} = makeDataAccessor(f, accessor);

  const push = (list: any, item?: any) => {
    const n = (list.length || 0) / (typeof list[0] === 'number' ? Math.floor(dims) : 1);
    callback(n, item);
  }

  if (raw && l != null) for (let i = 0; i < l; ++i) {
    push(raw[i]);
  }
  else if (fn && data) for (const v of data) {
    push(fn(v), v);
  }
}

/** Compose array-of-structs with fields `T | T[]` into struct-of-array data. */
export const CompositeData: LiveComponent<CompositeDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    fields,
    render,
    on,
    live = false,
  } = props;

  const fs = fields ?? NO_FIELDS;

  const isLoop = props.loop;
  const isStart = props.start;
  const isEnd = props.end;

  // Gather data layout/length
  const layout = useMemo(() => {

    // Count simple array lengths as fallback
    // in case of no composite field.
    const rawLength = fs.reduce((l: number | null, [, accessor]: DataField): number | null => {
      if (l != null) return l as number;
      if (typeof accessor === 'object') return accessor?.length;
      return l;
    }, 0) as number;

    // Look for index field
    const indexes = fs.filter(([,, accessorType]) => accessorType === 'index');
    const [index] = indexes;

    // Look for first non-index composite field
    const composites = fs.filter(([format,, accessorType]) => isComposite(format));
    const [composite] = composites;
    if (!composite) {
      const length = data?.length ?? rawLength ?? 0;
      return {chunks: [length], loops: undefined, starts: undefined, ends: undefined, dataCount: length, indexCount: length};
    }

    // Gather chunk sizes and chunk metadata
    const dataChunks = [] as number[];
    const indexChunks = index ? [] as number[] : undefined;
    const loops = isLoop ? [] as boolean[] : undefined;
    const starts = isStart ? [] as boolean[] : undefined;
    const ends = isEnd ? [] as boolean[] : undefined;

    iterateChunks(data, composite, (n: number, item?: any) => {
      dataChunks.push(n);

      if (item != null) {
        if (isLoop) {
          const loop = isLoop(item);
          loops!.push(!!loop);
        }
        if (isStart) {
          const start = isStart(item);
          starts!.push(!!start);
        }
        if (isEnd) {
          const end = isEnd(item);
          ends!.push(!!end);
        }
      }
    });

    if (index) {
      iterateChunks(data, index, (n: any) => indexChunks!.push(n));
    }

    const chunks = indexChunks ?? dataChunks;
    const indexed = indexChunks && dataChunks;

    const dataCount = getChunkCount(dataChunks, loops);
    const indexCount = indexChunks ? getChunkCount(indexChunks, loops) : 0;
    const offsets = indexed && accumulate(indexed);

    return {
      chunks,
      indexed,
      loops,
      starts,
      ends,
      offsets,
      dataCount,
      indexCount,
    };
  }, [data, fs]);

  const {chunks, indexed, loops, starts, ends, dataCount, indexCount} = layout;

  const lData = useBufferedSize(dataCount);
  const lIndex = useBufferedSize(indexCount);

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {

    const fieldBuffers = fs.map(([format, accessor, accessorType]) => {
      const composite = isComposite(format);
      format = composite ? toSimple(format) : format;

      const isIndex = accessorType === 'index';
      const isUnwelded = accessorType === 'unwelded';

      if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, fn} = makeDataAccessor(f, accessor);

      const l = isIndex || isUnwelded ? lIndex : lData;
      const {array, dims} = makeDataArray(f, l);

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
        bounds: {...NO_BOUNDS},
      };

      return {buffer, array, source, dims, accessor: fn, raw, composite, isIndex, isUnwelded};
    });

    const fieldSources = fieldBuffers.map(f => f.source);

    return [fieldBuffers, fieldSources];
  }, [device, fs, lData, lIndex]);
  
  // Refresh and upload data
  const refresh = () => {
    for (const {buffer, array, source, dims, accessor, raw, composite, isIndex, isUnwelded} of fieldBuffers) if (raw || data) {
      const a = accessor as Accessor;
      const c = isIndex || isUnwelded ? chunks : indexed ?? chunks;
      const l = (!indexed || isIndex) ? loops : undefined;
      const o = isIndex ? layout.offsets : undefined;

      if (composite) {
        if (raw) copyNumberArraysComposite(raw, array, dims, c, l, o);
        else if (data) copyDataArraysComposite(data, array, dims, a, c, l, o);
      }
      else {
        if (raw) copyNumberArrayChunked(raw, array, dims, c, l, layout.indexed);
        else if (data) copyDataArrayChunked(data, array, dims, a, c, l, o);
      }
      uploadBuffer(device, buffer, array.buffer);

      source.length  = isIndex || isUnwelded ? indexCount : dataCount;
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
    useMemo(refresh, [device, data, fieldBuffers, dataCount, indexCount]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh()
  }

  const trigger = useOne(() => signal(), fieldSources[0]?.version);

  if (on) {
    useNoYolo();

    const els = extend(on, layout);
    return gather(els, (sources: StorageSource[]) => {
      const s = [...fieldSources, ...sources];
      const view = useYolo(() => render ? render(...s) : yeet(s), [render, ...s]);
      return [trigger, view];
    });
  }
  else {
    const view = useYolo(() => render ? render(...fieldSources) : yeet(fieldSources), [render, fieldSources]);
    return [trigger, view];
  }
};
