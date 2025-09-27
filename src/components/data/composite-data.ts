import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Accessor, DataField, ChunkLayout } from '@use-gpu/core/types';
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
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
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

  render?: (sources: StorageSource[], layout: ChunkLayout) => LiveElement<any>,
};

const NO_FIELDS = [] as DataField[];

const isComposite = (format: string) => !!format.match(/^array</);
const toSimple = (format: string) => format.slice(6, -1);

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
  const {chunks, loops, starts, ends, count} = useMemo(() => {

    // Count simple array lengths as fallback
    // in case of no composite field.
    const rawLength = fs.reduce((l: number | null, [, accessor]: DataField): number | null => {
      if (l != null) return l as number;
      if (typeof accessor === 'object') return accessor?.length;
      return l;
    }, 0) as number;

    // Look for first composite field
    const composites = fs.filter(([format]) => isComposite(format));
    const [composite] = composites;
    if (!composite) {
      const length = data?.length ?? rawLength ?? 0;
      return [[length], [false], length];
    }

    // Read out chunk lengths and cycle flag
    let [format, accessor] = composite;
    format = toSimple(format);

    // Prepare format appropriate accessor
    if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
    const f = format as any as UniformType;
    const dims = UNIFORM_DIMS[f];

    let {raw, length: l, fn} = makeDataAccessor(f, accessor);

    // Gather chunk sizes and chunk metadata
    const chunks = [] as number[];
    const loops = isLoop ? [] as boolean[] : undefined;
    const starts = isStart ? [] as boolean[] : undefined;
    const ends = isEnd ? [] as boolean[] : undefined;

    const push = (list: any, item?: any) => {
      const n = (list.length || 0) / (typeof list[0] === 'number' ? dims : 1);
      chunks.push(n);

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
    }

    if (raw && l != null) for (let i = 0; i < l; ++i) {
      push(raw[i]);
    }
    else if (fn && data) for (const v of data) {
      push(fn(v), v);
    }

    const count = getChunkCount(chunks, loops);

    return {chunks, loops, starts, ends, count};
  }, [data, fs]);

  const l = useBufferedSize(count);

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {

    const fieldBuffers = fs.map(([format, accessor]) => {
      const composite = isComposite(format);
      format = composite ? toSimple(format) : format;

      if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, fn} = makeDataAccessor(f, accessor);

      const {array, dims} = makeDataArray(f, count);
      if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: 0,
        size: [0],
        version: 0,
      };

      return {buffer, array, source, dims, accessor: fn, raw, composite};
    });

    const fieldSources = fieldBuffers.map(f => f.source);

    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);
  
  // Refresh and upload data
  const refresh = () => {
    for (const {buffer, array, source, dims, accessor, raw, composite} of fieldBuffers) if (raw || data) {
      if (composite) {
        if (raw) copyNumberArraysComposite(raw, array, dims, chunks, loops);
        else if (data) copyDataArraysComposite(data, array, dims, chunks, loops, accessor as Accessor);
      }
      else {
        if (raw) copyNumberArrayChunked(raw, array, dims, chunks, loops);
        else if (data) copyDataArrayChunked(data, array, dims, chunks, loops, accessor as Accessor);
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

    const els = extend(on, {chunks, loops, starts, ends});
    return gather(els, (sources: ShaderSource[]) => {
      const s = [...fieldSources, ...sources];
      return render ? render(s) : yeet(s);
    });
  }
  else {
    return useMemo(() => render ? render(fieldSources) : yeet(fieldSources), [render, fieldSources]);
  }
};
