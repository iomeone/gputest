import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, StorageSource, UniformType, DataField } from '@use-gpu/core';
import { capture, yeet, makeContext, useCapture, useContext, useNoContext, useMemo, useOne, useRef, useResource, incrementVersion, makeCapture } from '@use-gpu/live';
import {
  makeIdAllocator,
  makeDataArray, copyNumberArrayRange,
  makeStorageBuffer, uploadBuffer, uploadBufferRange, UNIFORM_ARRAY_DIMS,
} from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

type Queued = {instance: number, data: Record<string, any>};
type FieldBuffer = {
  buffer: GPUBuffer,
  array: TypedArray,
  source: StorageSource,
  dims: number,
  accessor: string,
};

export type InstanceDataProps = {
  format?: 'u16' | 'u32',
  fields: [string, string][],
  alloc?: number,

  render?: (useInstance: () => (data: Record<string, any>) => void) => LiveElement,
  then?: (indices: StorageSource, data: StorageSource[]) => LiveElement,
};

export const InstanceData: LiveComponent<InstanceDataProps> = (props) => {
  const {
    fields: fs,
    format = 'u16',
    alloc = 64,
    then,
    render,
    children,
  } = props;

  const device = useDeviceContext();
  const versionRef = useRef(0);

  const [ids, queue, InstanceCapture] = useOne(() => [
    makeIdAllocator(0),
    [] as Queued[],
    makeCapture('InstanceCapture'),
  ]);

  // Provide hook to reserve and update an instance
  const useInstance = useMemo(() => {

    const makeUpdateInstance = (instance: number) => (data: Record<string, any>) => {
      queue.push({instance, data});
    };

    const useInstance = () => {
      const instance = useResource((dispose) => {
        const id = ids.obtain();
        dispose(() => ids.release(id));
        return id;
      });

      useCapture(InstanceCapture, null);

      return useOne(() => makeUpdateInstance(instance), makeUpdateInstance);
    };

    return useInstance;
  }, [device, fs]);

  // Produce instance sources
  const Resume = () => {    
    const size = Math.max(alloc, ids.max());
    const bufferLength = useBufferedSize(size);

    const prevBuffersRef = useRef(null as FieldBuffer[] | null);

    // Make/resize data buffers + index buffer
    const [fieldBuffers, fieldSources, indexBuffer, indexSource] = useMemo(() => {
      const {current: prevBuffers} = prevBuffersRef;

      const fieldBuffers = fs.map(([format, accessor], i) => {
        if (!(format in UNIFORM_ARRAY_DIMS)) throw new Error(`Unknown data format "${format}"`);
        const f = format as any as UniformType;
        const {array, dims} = makeDataArray(f, bufferLength);

        if (prevBuffers) {
          const prevArray = prevBuffers[i].array;
          const n = Math.min(prevArray.length, array.length);
          for (let i = 0; i < n; ++i) array[i] = prevArray[i];
        }

        const buffer = makeStorageBuffer(device, array.byteLength);
        const source = {
          buffer,
          format,
          length: bufferLength,
          size: [bufferLength],
          version: 0,
        };

        return {buffer, array, source, dims, accessor};
      });

      const fieldSources = fieldBuffers.map(f => f.source);

      let indexBuffer, indexSource;
      {
        if (format !== 'u16' && format !== 'u32') throw new Error(`Unknown index format "${format}"`);
        const {array, dims} = makeDataArray(format, bufferLength);
        const buffer = makeStorageBuffer(device, array.byteLength);
        const source = indexSource = {
          buffer,
          format,
          length: 0,
          size: [0],
          version: 0,
        };
        indexBuffer = {buffer, array, source, dims: 1};
      }

      return [fieldBuffers, fieldSources, indexBuffer, indexSource];
    }, [device, fs, bufferLength]);

    let needsRefresh = prevBuffersRef.current !== fieldBuffers
    prevBuffersRef.current = fieldBuffers;

    // Update data sparsely while calculating upload ranges
    let ranges = [];
    let range = null;
    for (const {instance, data} of queue) {
      if (!range) ranges.push(range = [instance, instance + 1]);
      else if (range[1] === instance) range[1]++;
      else ranges.push(range = [instance, instance + 1]);

      for (const {array, dims, accessor} of fieldBuffers) {
        const v = data[accessor];
        if (v != null) copyNumberArrayRange(v, array, 0, instance * Math.ceil(dims), Math.ceil(dims), dims);
      }
    }
    if (needsRefresh) ranges = [[0, size]];

    // Upload changed ranges
    if (ranges.length) {
      for (const {buffer, array, dims} of fieldBuffers) {
        const stride = Math.ceil(dims) * (array.byteLength / array.length);
        for (const [from, to] of ranges) {
          uploadBufferRange(device, buffer, array.buffer, from * stride, (to - from) * stride);
        }
      }
    }

    queue.length = 0;

    // Update instance ID buffer
    const version = ids.version();
    useOne(() => {
      const {buffer, array} = indexBuffer;

      let i = 0;
      for (const id of ids.all()) array[i++] = id;
      uploadBuffer(device, buffer, array.buffer);

      indexSource.length = i;
      indexSource.size[0] = i;
      indexSource.version = version;
    }, version);

    return then ? then(indexSource, fieldSources) : null;
  };

  return render ? capture(InstanceCapture, render(useInstance), Resume) : null;
};
