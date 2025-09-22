import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, StorageSource, UniformType, Accessor, DataField } from '@use-gpu/core/types';
import { RenderContext, FrameContext } from '@use-gpu/components';
import { yeet, useMemo, useSomeMemo, useNoMemo, useContext, useSomeContext, useNoContext } from '@use-gpu/live';
import {
  makeDataArray, copyDataArray, copyNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '@use-gpu/core';

export type DataProps = {
  length?: number,
  data?: any[],
  fields?: DataField[],
  live: boolean,

  render?: (sources: StorageSource[]) => LiveElement<any>,
};

const NO_FIELDS = [] as DataField[];

export const Data: LiveComponent<DataProps> = (fiber) => (props) => {
  const {device} = useContext(RenderContext);

  const {
    data, fields,
    live,
    render,
  } = props;

  const l = data?.length || 0;
  const fs = fields ?? NO_FIELDS;

  // Make data buffers
  const [fieldBuffers, fieldSources] = useMemo(() => {
    const fieldBuffers = fs.map(([format, accessor]) => {
      if (!(format in UNIFORM_DIMS)) throw new Error(`Unknown data format "${format}"`);
      const f = format as any as UniformType;

      let length = l, raw;
      if (typeof accessor === 'object' && 
          accessor.length === +accessor.length) {
        length = Math.floor(accessor.length / UNIFORM_DIMS[f]);
        raw = accessor;
      }
      else if (typeof accessor === 'string') {
        const k = accessor;
        accessor = (o: any) => o[k];
      }

      const {array, dims} = makeDataArray(f, length);
      if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length,
      };
      
      return {buffer, array, source, dims, accessor, raw};
    });
    const fieldSources = fieldBuffers.map(f => f.source);
    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);

  if (!live) {
    useNoContext(FrameContext);
    useSomeMemo(() => {
      for (const {buffer, array, dims, accessor, raw} of fieldBuffers) if (raw || data) {
        if (raw) copyNumberArray(raw, array);
        else if (data) copyDataArray(data, array, dims, accessor as Accessor);
        uploadBuffer(device, buffer, array.buffer);
      }
    }, [device, data, fieldBuffers]);
  }
  else {
    useSomeContext(FrameContext);
    useNoMemo();
    for (const {buffer, array, dims, accessor, raw} of fieldBuffers) if (raw || data) {
      if (raw) copyNumberArray(raw, array);
      else if (data) copyDataArray(data, array, dims, accessor as Accessor);
      uploadBuffer(device, buffer, array.buffer);
    }
  }

  return useMemo(() => render ? render(fieldSources) : yeet(fieldSources), [render, fieldSources]);
};
