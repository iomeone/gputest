import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { DataSchema, StructAggregateBuffer, StorageSource, UniformType } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import { capture, useCapture, useMemo, useOne, useRef, useResource, incrementVersion, makeCapture } from '@use-gpu/live';
import {
  makeIdAllocator,
  copyNumberArray,
  
  normalizeSchema,
  makeArrayAggregateBuffer,
  makeStructAggregateBuffer,
  makeStructAggregateFields,
  isUniformArrayType,

  uploadBuffer, uploadBufferRange,
  toCPUDims, toGPUDims,
} from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { QueueReconciler } from '../reconcilers/index';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { getRenderFunc } from '../hooks/useRenderProp';
import { getInstancedAggregate } from '../hooks/useInstancedSources';

const {signal} = QueueReconciler;

type Queued = {instances: number[], datas: Record<string, any>[]};

export type UseInstance = () => (data: Record<string, any>) => void;

export type InstanceDataProps<I extends 'u16' | 'u32' | undefined> = {
  format?: I,
  schema: DataSchema,
  reserve?: number,

  render?: (useInstance: () => (data: Record<string, any>) => void) => LiveElement,
  children?: (useInstance: () => (data: Record<string, any>) => void) => LiveElement,
  then?: 'u16' | 'u32' extends I
    ? (data: Record<string, ShaderSource>, indices: StorageSource) => LiveElement
    : (data: Record<string, ShaderSource>) => LiveElement
};

export const InstanceData: LiveComponent<InstanceDataProps<'u16' | 'u32' | undefined>> = <I extends 'u16' | 'u32' | undefined>(props: InstanceDataProps<I>) => {
  const {
    schema: propSchema,
    format,
    reserve = 64,
    then,
  } = props;

  const device = useDeviceContext();
  const versionRef = useRef(0);

  const schema = useOne(() => normalizeSchema(propSchema), propSchema);
  const uniforms = useMemo(
    () => {
      const out = [];
      for (const k in schema) {
        const {format, index, unwelded} = schema[k];
        const f = format as UniformType;
        if (index || unwelded) throw new Error(`Indexed and unwelded data not supported in <InstanceData>. Use <Data>.`);
        if (isUniformArrayType(f)) throw new Error(`Array data not supported in <InstanceData>. Use <Data>.`);
        out.push({name: k, format: f});
      }
      return out;
    },
    [schema]
  );

  const [ids, queue, InstanceCapture] = useOne(() => [
    makeIdAllocator(0),
    {instances: [], datas: []} as Queued,
    makeCapture('InstanceCapture'),
  ]);

  // Provide hook to reserve and update an instance
  const useInstance = useMemo(() => {

    const makeUpdateInstance = (instance: number) => (data: Record<string, any>) => {
      queue.instances.push(instance);
      queue.datas.push(data);

      return instance;
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
  }, [device, uniforms]);

  // Produce instance sources
  const Resume = () => {
    const size = Math.max(reserve, ids.max());
    const alloc = useBufferedSize(size);

    const prevBufferRef = useRef(null as StructAggregateBuffer | null);

    // Make/resize data buffers + index buffer
    const [aggregateBuffer, indexBuffer, fields, sources] = useMemo(() => {
      const aggregateBuffer = makeStructAggregateBuffer(device, uniforms, alloc);
      const {current: prevBuffer} = prevBufferRef;

      if (prevBuffer) {
        const from = new Uint32Array(prevBuffer.raw);
        const to = new Uint32Array(aggregateBuffer.raw);
        copyNumberArray(from, to, 1, 1, 0, 0, Math.min(from.length, to.length));
      }

      if (format != null && format !== 'u16' && format !== 'u32') throw new Error(`Unknown index format "${format}"`);
      const indexBuffer = format ? makeArrayAggregateBuffer(device, format, alloc) : null;

      const fields = makeStructAggregateFields(aggregateBuffer);
      const sources = getInstancedAggregate(aggregateBuffer, indexBuffer?.source);

      return [aggregateBuffer, indexBuffer, fields, sources];
    }, [device, uniforms, alloc]);

    const needsRefresh = prevBufferRef.current !== aggregateBuffer;
    prevBufferRef.current = aggregateBuffer;

    // Update data sparsely while calculating upload ranges
    const ranges = [];
    let range = null;
    const {instances, datas} = queue;
    const n = instances.length;
    for (let i = 0; i < n; ++i) {
      const instance = instances[i];
      const data = datas[i];

      if (!range) ranges.push(range = [instance, instance + 1]);
      else if (range[1] === instance) range[1]++;
      else ranges.push(range = [instance, instance + 1]);

      for (const k in fields) {
        const {prop = k} = schema[k];
        const {array, base = 0, stride = 1, dims} = fields[k];
        const v = data[prop];

        if (v != null) {
          const fromDims = toCPUDims(dims);
          const toDims = toGPUDims(dims);
          copyNumberArray(v, array, fromDims, toDims, 0, base + instance * stride, 1, stride);
        }
      }
    }

    // Upload changed ranges
    const {buffer, raw, layout} = aggregateBuffer;
    const {length: stride} = layout;
    if (needsRefresh) {
      uploadBufferRange(device, buffer, raw, 0, size * stride);
      versionRef.current = incrementVersion(versionRef.current);
    }
    else if (ranges.length) {
      for (const [from, to] of ranges) {
        uploadBufferRange(device, buffer, raw, from * stride, (to - from) * stride);
      }
      versionRef.current = incrementVersion(versionRef.current);
    }
    queue.instances.length = queue.datas.length = 0;

    // Update instance ID buffer
    const version = ids.version();
    useOne(() => {
      if (!indexBuffer) return;
      const {buffer, array, source} = indexBuffer;

      let i = 0;
      for (const id of ids.all()) array[i++] = id;
      uploadBuffer(device, buffer, array.buffer);

      source.length = i;
      source.size[0] = i;
      source.version = version;
    }, version);

    const trigger = useOne(() => signal(), versionRef.current);
    return then ? [trigger, then(sources, indexBuffer?.source as any)] : trigger;
  };

  const render = getRenderFunc(props);
  return render ? capture(InstanceCapture, render(useInstance), Resume) : null;
};
