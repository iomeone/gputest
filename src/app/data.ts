import { LiveComponent, LiveElement } from '../live/types';
import { TypedArray, StorageSource, UniformType, Accessor, DataField } from '../core/types';
import { RenderContext, FrameContext } from '../components';
import { yeet, useMemo, useSomeMemo, useNoMemo, useContext, useSomeContext, useNoContext } from '../live';
import {
  makeDataEmitter, makeDataArray, copyDataArray, emitIntoNumberArray, 
  makeStorageBuffer, uploadBuffer, UNIFORM_DIMS,
} from '../core';

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

      const {array, dims} = makeDataArray(f, l || 1);
      if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

      const buffer = makeStorageBuffer(device, array.byteLength);
      const source = {
        buffer,
        format,
        length: l,
      };
      
      if (typeof accessor === 'string') {
        const k = accessor;
        accessor = (o: any) => o[k];
      }
      
      return {buffer, array, source, dims, accessor};
    });
    const fieldSources = fieldBuffers.map(f => f.source);
    return [fieldBuffers, fieldSources];
  }, [device, fs, l]);

  if (!live) {
    useNoContext(FrameContext);
    useSomeMemo(() => {
      if (data) {
        for (const {buffer, array, dims, accessor} of fieldBuffers) {
          copyDataArray(data, array, dims, accessor);
          console.log({data, array})
          uploadBuffer(device, buffer, array.buffer);
        }
      }
    }, [device, data, fieldBuffers]);
  }
  else {
    useSomeContext(FrameContext);
    useNoMemo();
    if (data) {
      for (const {buffer, array, dims, accessor} of fieldBuffers) {
        copyDataArray(data, array, dims, accessor);
        uploadBuffer(device, buffer, array.buffer);
      }
    }
  }

  return render ? render(fieldSources) : null;
};
