import { LiveComponent, LiveElement } from '../live/types';
import { TypedArray, StorageSource } from '../core/types';
import { RenderContext } from '../components';
import { yeet, useNoMemo, useMemo, useContext } from '../live';
import {
  makeStorageBuffer, uploadBuffer, UNIFORM_SIZES,
} from '../core';

const makeEmitter = (to: TypedArray, dims: number) => {
  let i = 0;
  if (dims === 1) return (a: number) => { to[i++] = a; }
  if (dims === 2) return (a: number, b: number) => { to[i++] = a; to[i++] = b; }
  if (dims === 3) return (a: number, b: number, c: number) => { to[i++] = a; to[i++] = b; to[i++] = c; }
  if (dims === 4) return (a: number, b: number, c: number, d: number) => { to[i++] = a; to[i++] = b; to[i++] = c; to[i++] = d; }
}

const copyArray = (from: TypedArray, to: TypedArray) => {
  const n = Math.min(from.length, to.length);
  for (let i = 0; i < n; ++i) to[i] = from[i];
}

const emitArray = (expr: Emitter, to: TypedArray, dims: number) => {
  const emit = makeEmitter(dims, to);
  const n = to.length / dims;
  let i = 0;
  for (let i = 0; i < n; ++i) expr(emit, i, n);
}

type Emitter = (a?: number, b?: number, c?: number, d?: number) => void;

export type RawDataProps = {
  size?: number,
  data?: number[] | TypedArray,
  expr?: (emit: Emitter, i: number, n: number) => void,
  type?: string,
  dims?: number,
  live: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
};

const CTORS = {
  'float': Float32Array,
  'double': Float64Array,
  'int': Int32Array,
  'uint': Uint32Array,
};

const TYPE_ALIASES = {
  'float2': 'vec2',
  'float3': 'vec3',
  'float4': 'vec4',
  'double2': 'dvec2',
  'double3': 'dvec3',
  'double4': 'dvec4',
  'int2': 'ivec4',
  'int3': 'ivec4',
  'int4': 'ivec4',
  'uint2': 'uvec4',
  'uint3': 'uvec4',
  'uint4': 'uvec4',
};

const TYPE_LOOKUP = {};
for (let k in TYPE_ALIASES) TYPE_LOOKUP[TYPE_ALIASES[k]] = k;

export const RawData: LiveComponent<RawDataProps> = (fiber) => (props) => {
  const {device} = useContext(RenderContext);
  let {
    size, dims,
    data, expr,
    live, type,
    render,
  } = props;

  const lookup = TYPE_LOOKUP[type] ?? type;
  if (type) {
    const number = type.match(/[0-9]/);
    if (number) dims = +number[0];
    type = type.replace(/[0-9]+/g, '');
  }

  if (dims === 3) throw new Error("Dims must be 1, 2, or 4");
  const d = dims || 4;
  const t = (type in CTORS) ? type : 'float';
  const s = size != null ? size : (Math.floor(data?.length / d) || 1);

  // Make data buffer
  const [buffer, array] = useMemo(() => {
    const n = d * s;

    const ctor = CTORS[t];
    const stride = UNIFORM_SIZES[t];

    const array = new ctor(n);
    const buffer = makeStorageBuffer(device, n * stride);

    return [buffer, array] as [GPUBuffer];
  }, [device, s, d, t]);

  // Make storage source
  const source = useMemo(() => {
    const type = TYPE_ALIASES[t + d] ?? 'float';
    return {
      buffer,
      type,
      length: s,
    };
  }, [buffer, t]);

  // Update data
  if (!live) {
    useMemo(() => {
      if (data) copyArray(data, array);
      if (expr) emitArray(expr, array, dims);
      uploadBuffer(device, buffer, array.buffer);
    }, [data, expr]);
  }
  else useNoMemo();

  return render ? render(source) : null;
  /*
  // Return a lambda back to parent(s)
  return yeet(() => {
    // Update live data
    if (live) {
      if (data) copyArray(data, bufferData);
      if (expr) emitArray(expr, bufferData, dims);
      uploadBuffer(device, buffer, bufferData);
    }
    return storageBuffer;
  });
  */
};
