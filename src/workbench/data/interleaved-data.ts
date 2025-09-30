import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { LambdaSource, UniformType, VectorLike, DataSchema } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { QueueReconciler } from '../reconcilers/index';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { useRenderProp } from '../hooks/useRenderProp';
import { useStructSources } from '../hooks/useStructSources';
import { useOne, useMemo, useNoMemo } from '@use-gpu/live';
import {
  makePackedLayout,
  normalizeSchema,
  makeStructAggregateBuffer,
  makeStructAggregateFields,
  uploadStorage,
  isUniformArrayType,
} from '@use-gpu/core';

const {signal} = QueueReconciler;

export type InterleavedDataProps = {
  /** Input data, array of flat values with packed array-of-structs layout */
  data?: VectorLike,
  /** WGSL schema of input data */
  schema: DataSchema,
  /** Resample `data` on every animation frame. */
  live?: boolean,

  /** Receive 1 source per field, in struct-of-array format. Leave empty to yeet sources instead. */
  render?: (sources: Record<string, LambdaSource>) => LiveElement,
  children?: (sources: Record<string, LambdaSource>) => LiveElement,
};

/** Use a flat, packed array with interleaved fields `T` without any struct alignment/padding. */
export const InterleavedData: LiveComponent<InterleavedDataProps> = (props) => {
  const device = useDeviceContext();

  const {
    data,
    schema: propSchema,
    live = false,
  } = props;

  const schema = useOne(() => normalizeSchema(propSchema), propSchema);
  const typedArray = useOne(() => Array.isArray(data) ? new Float32Array(data) : data ?? new Float32Array(256), data);

  const uniforms = useMemo(
    () => {
      const out = [];
      for (const k in schema) {
        const {format, index, unwelded} = schema[k];
        const f = format as UniformType;
        if (index || unwelded) throw new Error(`Use <Data> for indexed and unwelded data`);
        if (isUniformArrayType(format)) throw new Error(`Use <Data> for array data`);
        out.push({name: k, format: f});
      }
      return out;
    },
    [schema]
  );

  // Gather data layout/length
  const [packedLayout, dataCount, dataStride, bytesPerElement] = useMemo(() => {

    const {byteLength, BYTES_PER_ELEMENT} = typedArray;
    const layout = makePackedLayout(uniforms);

    const dataCount = byteLength / layout.length;
    const dataStride = layout.length / BYTES_PER_ELEMENT;
    const bytesPerElement = BYTES_PER_ELEMENT;

    return [layout, dataCount, dataStride, bytesPerElement];
  }, [typedArray, uniforms]);

  const bufferLength = useBufferedSize(dataCount);

  // Make aggregate buffer
  const [aggregateBuffer, fields] = useMemo(() => {
    const aggregateBuffer = makeStructAggregateBuffer(device, uniforms, bufferLength);
    const fields = makeStructAggregateFields(aggregateBuffer);

    return [aggregateBuffer, fields];
  }, [device, uniforms, bufferLength]);

  // Refresh and upload data
  const refresh = () => {
    if (!typedArray) return;
    const {raw, source} = aggregateBuffer;
    const {attributes} = packedLayout;

    let f = 0;
    for (const k in fields) {
      const {array, base = 0, stride = 1, dims} = fields[k];

      let src = attributes[f].offset / bytesPerElement;
      let dst = base;
      for (let i = 0; i < dataCount; ++i) {
        const p = src;
        for (let j = 0; j < dims; ++j) array[dst + j] = typedArray[p + j];
        dst += stride;
        src += dataStride;
      }

      uploadStorage(device, source, raw, dataCount);
      ++f;
    }
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, data, aggregateBuffer, dataCount]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh()
  }

  const {source} = aggregateBuffer;
  const sources = useStructSources(uniforms, source, 'interleavedData');

  const trigger = useOne(() => signal(), source.version);

  const view = useRenderProp(props, sources);
  return [trigger, view];
};
