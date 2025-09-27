import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, Accessor, DataField, ChunkLayout } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { yeet, extend, gather, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, makeDataAccessor,
  copyDataArray, copyNumberArray,
  copyDataArrays, copyNumberArrays,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrayChunked, copyNumberArrayChunked,
  getChunkCount,
  makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS,
} from '@use-gpu/core';

export type CompositeDataProps = {
  length?: number,
  data?: any[],
  fields?: DataField[],
  live?: boolean,

  loop?: <T>(t: T[]) => boolean,
  start?: <T>(t: T[]) => boolean,
  end?: <T>(t: T[]) => boolean,
  
  on?: LiveElement<any>,

  render?: (...sources: StorageSource[]) => LiveElement<any>,
};

const NO_FIELDS = [] as DataField[];

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
    const composites = fs.filter(([format,, accessorType]) => isComposite(format) && accessorType !== 'index');
    const [composite] = composites;
    if (!composite) {
      const length = data?.length ?? rawLength ?? 0;
      return {chunks: [length], loops: undefined, starts: undefined, ends: undefined, count: length};
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

    const count = getChunkCount(chunks, loops);
    const offsets = indexed && accumulate(indexed);

    return {
      chunks,
      loops,
      starts,
      ends,
      count,
      indexed,
      offsets,
    };
  }, [data, fs]);

  const {chunks, loops, starts, ends, count} = layout;
  const l = useBufferedSize(count);

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {

    const fieldBuffers = fs.map(([format, accessor, accessorType]) => {
      const composite = isComposite(format);
      format = composite ? toSimple(format) : format;

      if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, fn} = makeDataAccessor(f, accessor);

      const {array, dims} = makeDataArray(f, l);

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
      };

      const isIndex = accessorType === 'index';
      return {buffer, array, source, dims, accessor: fn, raw, composite, isIndex};
    });

    const fieldSources = fieldBuffers.map(f => f.source);

    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);
  
  // Refresh and upload data
  const refresh = () => {
    for (const {buffer, array, source, dims, accessor, raw, composite, isIndex} of fieldBuffers) if (raw || data) {
      const a = accessor as Accessor;
      const c = isIndex ? chunks : layout.indexed ?? chunks;
      const l = (!layout.indexed || isIndex) ? loops : undefined;
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

      source.length = count;
      source.size[0] = count;
      source.version = incrementVersion(source.version);
    }
  };
  
  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, data, fieldBuffers, count]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh()
  }
  
  if (on) {
    useNoMemo();

    const els = extend(on, layout);
    return gather(els, (sources: StorageSource[]) => {
      const s = [...fieldSources, ...sources];
      return render ? render(...s) : yeet(s);
    });
  }
  else {
    return useMemo(() => render ? render(...fieldSources) : yeet(fieldSources), [render, fieldSources]);
  }
};
