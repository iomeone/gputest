import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Accessor, DataField } from '@use-gpu/core/types';
import { DeviceContext, FrameContext } from '@use-gpu/components';
import { yeet, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import {
  makeDataArray, makeDataAccessor,
  copyDataArray, copyNumberArray,
  copyDataArrays, copyNumberArrays,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrayChunked, copyNumberArrayChunked,
  copyChunksToSegments,
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '@use-gpu/core';

export type CompositeDataProps = {
  length?: number,
  data?: any[],
  fields?: DataField[],
  live?: boolean,
  isLoop?: <T>(t: T[]) => boolean,

  render?: (sources: StorageSource[]) => LiveElement<any>,
};

const NO_FIELDS = [] as DataField[];

const isComposite = (format: string) => !!format.match(/\[\]$/);
const toSimple = (format: string) => format.replace(/\[\]$/, '');

export const CompositeData: LiveComponent<CompositeDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    fields,
    render,
    live = false,
  } = props;

  const fs = fields ?? NO_FIELDS;
  let isLoop = props.isLoop ?? (() => false);

  // Gather data length
  const [chunks, loops, length] = useMemo(() => {

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

    const chunks = [] as number[];
    const loops = [] as boolean[];

    if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
    const f = format as any as UniformType;
    const dims = UNIFORM_DIMS[f];

    let {raw, length: l, fn} = makeDataAccessor(f, accessor);

    if (raw && l != null) for (let i = 0; i < l; ++i) {
      const list = raw[i];
      const loop = isLoop(list);
      const n = (list.length || 0) / (typeof list[0] === 'number' ? dims : 1);
      chunks.push(n);
      loops.push(loop);
    }
    else if (fn && data) for (const v of data) {
      const list = fn(v);
      const loop = isLoop(v);
      const n = (list.length || 0) / (typeof list[0] === 'number' ? dims : 1);
      chunks.push(n);
      loops.push(loop);
    }

    const length = (
      chunks.reduce((a, b) => a + b, 0) +
      loops.reduce((a, b) => a + (b ? 3 : 0), 0)
    );
    return [chunks, loops, length];
  }, [data, fs]);

  // Make data buffers
  const [segmentBuffer, fieldBuffers, fieldSources] = useMemo(() => {

    const fieldBuffers = fs.map(([format, accessor]) => {
      const composite = isComposite(format);
      format = toSimple(format);

      if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let {raw, fn} = makeDataAccessor(f, accessor);

      const {array, dims} = makeDataArray(f, length);
      if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length,
        version: 0,
      };

      return {buffer, array, source, dims, accessor: fn, raw, composite};
    });

    let segmentBuffer;
    {
      const format = UniformType.int;
      const {array, dims} = makeDataArray(format, length);
      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length,
        version: 0,
      };
      segmentBuffer = {buffer, array, source, dims};
    }

    const fieldSources = [
      segmentBuffer.source,
      ...fieldBuffers.map(f => f.source),
    ];
    
    return [segmentBuffer, fieldBuffers, fieldSources];
  }, [device, fs, length]);
  
  // Refresh and upload data
  const refresh = () => {
    {
      const {buffer, array, source} = segmentBuffer;
      copyChunksToSegments(array, chunks, loops);

      uploadBuffer(device, buffer, array.buffer);
      source.version = incrementVersion(source.version);
    }

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
      source.version = incrementVersion(source.version);
    }
  };
  
  if (!live) {
    useNoContext(FrameContext);
    useMemo(refresh, [device, data, fieldBuffers]);
  }
  else {
    useContext(FrameContext);
    useNoMemo();
    refresh()
  }

  return useMemo(() => render ? render(fieldSources) : yeet(fieldSources), [render, fieldSources]);
};
