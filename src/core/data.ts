import type { TypedArray, UniformType, UniformAttribute, Emitter, Emit, Accessor, AccessorSpec, DataBoundingBox, DataBounds } from './types';
import { UNIFORM_ARRAY_TYPES, UNIFORM_ARRAY_DIMS, UNIFORM_ATTRIBUTE_SIZES } from './constants';
import { seq } from './tuple';

import { vec4 } from 'gl-matrix';

type NumberArray = TypedArray | number[];

const NO_LOOPS = [] as boolean[];
const NO_ENDS = [] as [boolean, boolean][];

export const toDims3 = (dims: number) => {
  if (dims === Math.round(dims)) return dims;
  return Math.ceil(dims) / 4 * 3;
};

export const alignSizeTo = (n: number, s: number) => {
  let f = n % s;
  return f === 0 ? n : n + (s - f);
};

export const getDataArrayConstructor = (type: UniformType) => UNIFORM_ARRAY_TYPES[type];

export const getDataArrayByteLength = (type: UniformType, length: number) => {
  const size = UNIFORM_ATTRIBUTE_SIZES[type];
  return alignSizeTo(length * size, 4);
};

export const makeDataArray = (type: UniformType, length: number) => {
  const ctor = UNIFORM_ARRAY_TYPES[type];
  const dims = UNIFORM_ARRAY_DIMS[type];

  const n = alignSizeTo(length * Math.ceil(dims), 4);

  const array = new ctor(n);
  return {array, dims};
};

export const makeDataEmitter = (to: NumberArray, dims: number): {
  emit: Emit,
  emitted: () => number,
  reset: () => void,
} => {
  let i = 0;
  const emitted = () => i / Math.ceil(dims);
  const reset = () => i = 0;

  if (dims === 1)   return {reset, emitted, emit: (a: number) => { to[i++] = a; }};
  if (dims === 2)   return {reset, emitted, emit: (a: number, b: number) => { to[i++] = a; to[i++] = b; }};
  if (dims === 3)   return {reset, emitted, emit: (a: number, b: number, c: number) => { to[i++] = a; to[i++] = b; to[i++] = c; }};
  if (dims === 3.5) return {reset, emitted, emit: (a: number, b: number, c: number) => { to[i++] = a; to[i++] = b; to[i++] = c; i++; }}; // !
  if (dims === 4)   return {reset, emitted, emit: (a: number, b: number, c: number, d: number) => { to[i++] = a; to[i++] = b; to[i++] = c; to[i++] = d; }};
  return {
    reset,
    emitted,
    emit: (...args: number[]) => {
      const n = args.length;
      for (let j = 0; j < n; ++j) to[i++] = args[j];
    },
  };
}

export const makeDataAccessor = (format: UniformType, accessor: AccessorSpec) => {
  if (typeof accessor === 'object' &&
      accessor.length === +accessor.length) {
    length = Math.floor(accessor.length / Math.floor(UNIFORM_ARRAY_DIMS[format]));
    return {raw: accessor as any[], length};
  }
  else if (typeof accessor === 'string') {
    const k = accessor;
    return {fn: (o: any) => o[k] as any};
  }
  else if (typeof accessor === 'function') {
    return {fn: accessor as Accessor};
  }
  else throw new Error(`Invalid accessor ${accessor}`);
}

export const emitIntoNumberArray = <T>(expr: Emitter, to: NumberArray, dims: number, props?: T) => {
  const {emit, emitted} = makeDataEmitter(to, dims);
  const n = to.length / Math.ceil(dims);
  for (let i = 0; i < n; i++) expr(emit, i, props);
  return emitted();
}

export const emitIntoMultiNumberArray = <T>(expr: Emitter, to: NumberArray, dims: number, size: number[], props?: T) => {
  const n = size.length;

  const index = size.map(_ => 0);
  const increment = () => {
    for (let i = 0; i < n; ++i) {
      let c = index[i];
      if (c === size[i] - 1) index[i] = 0;
      else {
        index[i] = c + 1;
        break;
      }
    }
  };

  let nest: Emitter;
  if (n === 1) {
    nest = (emit: Emit) => {
      expr(emit, index[0], props);
      increment();
    };
  }
  else if (n === 2) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], props);
      increment();
    };
  }
  else if (n === 3) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], index[2], props);
      increment();
    };
  }
  else if (n === 4) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], index[2], index[3], props);
      increment();
    };
  }
  else {
    nest = (emit: Emit) => {
      expr(emit, ...index, props);
      increment();
    };
  }
  
  return emitIntoNumberArray(nest, to, dims);
}

export const flattenIndexedArray = (from: NumberArray, indices: NumberArray, dims: number = 1) => {
  const n = indices.length;
  const flat = new Float32Array(n * Math.ceil(dims));

  let o = 0;
  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const j = indices[i];
      flat[o++] = from[j];
    }
  }
  else if (dims === 2) {
    for (let i = 0; i < n; ++i) {
      const j = indices[i] * 2;
      flat[o++] = from[j];
      flat[o++] = from[j + 1];
    }
  }
  else if (dims === 3) {
    for (let i = 0; i < n; ++i) {
      const j = indices[i] * 3;
      flat[o++] = from[j];
      flat[o++] = from[j + 1];
      flat[o++] = from[j + 2];
    }
  }
  else if (dims === 3.5) {
    for (let i = 0; i < n; ++i) {
      const j = indices[i] * 3;
      flat[o++] = from[j];
      flat[o++] = from[j + 1];
      flat[o++] = from[j + 2];
      o++;
    }
  }
  else if (dims === 4) {
    for (let i = 0; i < n; ++i) {
      const j = indices[i] * 4;
      flat[o++] = from[j];
      flat[o++] = from[j + 1];
      flat[o++] = from[j + 2];
      flat[o++] = from[j + 3];
    }
  }
  return flat;
};

export const copyNumberArray = (from: NumberArray, to: NumberArray, dims: number = 1) => {
  if (dims === 3.5) {
    const n = Math.min(from.length, Math.floor(to.length * 3/4));
    for (let i = 0, j = 0; i < n;) {
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
    }
  }
  else if (dims === 7.5) {
    const n = Math.min(from.length, Math.floor(to.length * 3/4));
    for (let i = 0, j = 0; i < n;) {
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
    }
  }
  else if (dims === 11.5) {
    const n = Math.min(from.length, Math.floor(to.length * 3/4));
    for (let i = 0, j = 0; i < n;) {
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
    }
  }
  else if (dims === 15.5) {
    const n = Math.min(from.length, Math.floor(to.length * 3/4));
    for (let i = 0, j = 0; i < n;) {
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
      to[j++] = from[i++];
      to[j++] = from[i++];
      to[j++] = from[i++];
      j++;
    }
  }
  else {
    const n = Math.min(from.length, to.length);
    for (let i = 0; i < n; ++i) to[i] = from[i];
  }
}

export const copyNumberArrays = (from: NumberArray[], to: NumberArray, dims: number = 1) => {
  let pos = 0;
  const n = from.length;
  const dims3 = toDims3(dims);
  const dims4 = Math.ceil(dims);
  for (let i = 0; i < n; ++i) {
    const src = from[i];
    const l = src.length;
    copyNumberArrayRange(src, to, 0, pos, l, dims);
    pos += (l / dims3) * dims4;
  }
}

export const copyNumberArrayRange = (
  from: NumberArray, to: NumberArray,
  fromIndex: number, toIndex: number, length: number,
  dims: number = 1, offset: number = 0,
) => {
  if (dims === 3.5) {
    const n = length;
    for (let i = 0, j = 0; i < n;) {
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
    }
  }
  else if (dims === 7.5) {
    const n = length;
    for (let i = 0, j = 0; i < n;) {
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
    }
  }
  else if (dims === 11.5) {
    const n = length;
    for (let i = 0, j = 0; i < n;) {
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
    }
  }
  else if (dims === 15.5) {
    const n = length;
    for (let i = 0, j = 0; i < n;) {
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      to[toIndex + j++] = from[fromIndex + i++] + offset;
      j++;
    }
  }
  else {
    const n = length;
    for (let i = 0; i < n; ++i) to[i + toIndex] = from[i + fromIndex] + offset;
  }
}

export const copyNestedNumberArrayRange = (
  from: NumberArray[], to: NumberArray,
  fromIndex: number, toIndex: number, length: number,
  dims: number = 1, offset: number = 0,
) => {
  const n = length;
  let j = toIndex;
  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      to[j++] = (v[0] ?? v) + offset;
    }
  }
  else if (dims === 2) {
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      to[j] = v[0] + offset;
      to[j + 1] = v[1] + offset;
      j += 2;
    }
  }
  else if (dims === 3) {
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      to[j] = v[0] + offset;
      to[j + 1] = v[1] + offset;
      to[j + 2] = v[2] + offset;
      j += 3;
    }
  }
  else if (dims === 3.5) {
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      to[j] = v[0] + offset;
      to[j + 1] = v[1] + offset;
      to[j + 2] = v[2] + offset;
      j += 4; // !
    }
  }
  else if (dims === 4) {
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      to[j] = v[0] + offset;
      to[j + 1] = v[1] + offset;
      to[j + 2] = v[2] + offset;
      to[j + 3] = v[3] + offset;
      j += 4;
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    for (let i = 0; i < n; ++i) {
      const v = from[i + fromIndex];
      for (let k = 0; k < dims; ++k) {
        to[j + k] = v[k] + offset;
      }
      j += dims;
    }
  }
}

export const copyNestedNumberArray = (from: NumberArray[], to: NumberArray, dims: number) =>
  copyNestedNumberArrayRange(from, to, 0, 0, from.length, dims);

export const copyDataArray = (from: any[], to: NumberArray, dims: number, accessor: Accessor) => {
  const n = Math.min(from.length, Math.floor(to.length / dims));
  let j = 0;
  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      to[i] = accessor(from[i]);
    }
  }
  else if (dims === 2) {
    for (let i = 0; i < n; ++i) {
      [to[j++], to[j++]] = accessor(from[i]);
    }
  }
  else if (dims === 3) {
    for (let i = 0; i < n; ++i) {
      [to[j++], to[j++], to[j++]] = accessor(from[i]);
    }
  }
  else if (dims === 3.5) {
    for (let i = 0; i < n; ++i) {
      [to[j++], to[j++], to[j++]] = accessor(from[i]);
      j++; // !
    }
  }
  else if (dims === 4) {
    for (let i = 0; i < n; ++i) {
      [to[j++], to[j++], to[j++], to[j++]] = accessor(from[i]);
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    for (let i = 0; i < n; ++i) {
      const v = accessor(from[i]);
      for (let k = 0; k < v.length; ++k) to[j++] = v[k];
    }
  }
}

export const copyDataArrays = (from: any[], to: NumberArray, dims: number, accessor: Accessor) => {
  let pos = 0;
  const n = from.length;
  const dims3 = toDims3(dims);
  const dims4 = Math.ceil(dims);
  for (let i = 0; i < n; ++i) {
    const src = accessor(from[i]);
    const l = src.length;
    const el = src[0];
    if (el != null) {
      if (typeof el === 'number') {
        copyNumberArrayRange(src, to, 0, pos, l, dims);
        pos += Math.floor(l / dims3) * dims4;
      }
      else if (typeof el[0] === 'number') {
        copyNestedNumberArrayRange(src, to, 0, pos, l, dims);
        pos += l * dims4;
      }
    }
  }
}

export const getChunkCount = (
  chunks: number[],
  loops: boolean[] = NO_LOOPS,
) => {
  let length = 0;
  let n = chunks.length;

  let count = 0;
  for (let i = 0; i < n; ++i) {
    const c = chunks[i];
    const l = loops[i];
    count += c + (l ? 3 : 0);
  }

  return count;
};

export const generateChunkSegments = (
  to: NumberArray,
  lookup: NumberArray | null | undefined,
  chunks: number[],
  loops: boolean[] = NO_LOOPS,
  starts: boolean[] | boolean = false,
  ends: boolean[] | boolean = false,
) => {
  let pos = 0;
  let n = chunks.length;

  for (let i = 0; i < n; ++i) {
    const c = chunks[i];
    const l = loops[i];
    const s = starts === true || (starts as any)[i];
    const e = ends === true || (ends as any)[i];

    const b = pos;

    if (l) to[pos++] = 0;
    if (c) {
      if (c === 1) to[pos++] = 0;
      else {
        if (l && !s && !e) {
          for (let i = 0; i < c; ++i) to[pos++] = 3;
          if (l) to[pos++] = 0;
        }
        else if (l) {
          to[pos++] = 1;
          for (let i = 1; i < c; ++i) to[pos++] = 3;
          to[pos++] = 2;
        }
        else {
          to[pos++] = 1;
          for (let i = 2; i < c; ++i) to[pos++] = 3;
          to[pos++] = 2;
        }
      }
    }
    if (l) to[pos++] = 0;

    if (lookup) for (let j = b; j < pos; ++j) lookup[j] = i;
  }

  while (pos < to.length) to[pos++] = 0;
}

export const generateChunkAnchors = (
  anchors: NumberArray,
  trims: NumberArray,
  chunks: number[],
  loops: boolean[] = NO_LOOPS,
  starts: boolean[] | boolean = false,
  ends: boolean[] | boolean = false,
) => {

  const n = chunks.length;
  for (let i = 0; i < trims.length; ++i) trims[i] = 0;

  const hasStart = !!starts;
  const hasEnd = !!ends;

  let o = 0;
  let pos = 0;
  if (hasStart || hasEnd) for (let i = 0; i < n; ++i) {
    const c = chunks[i];
    const l = loops[i];

    const s = hasStart && (starts === true || starts[i]);
    const e = hasEnd && (ends === true || ends[i]);

    const both = s && e ? 1 : 0;
    const bits = +s + (+e << 1);

    const start = pos + (l ? 1 : 0);
    const end = pos + c - 1 + (l ? 2 : 0);
    pos += c + (l ? 3 : 0);

    for (let j = start; j <= end; ++j) {
      trims[j * 4] = start;
      trims[j * 4 + 1] = end;
      trims[j * 4 + 2] = bits;
      trims[j * 4 + 3] = 0;
    }

    if (s) {
      anchors[o++] = start;
      anchors[o++] = start + 1;
      anchors[o++] = end;
      anchors[o++] = both;
    }
    if (e) {
      anchors[o++] = end;
      anchors[o++] = end - 1;
      anchors[o++] = start;
      anchors[o++] = both;
    }
  }

  return o / 4;
}

export const generateChunkFaces = (
  to: NumberArray,
  lookup: NumberArray | null | undefined,
  chunks: number[],
  loops: boolean[] = NO_LOOPS,
) => {
  let pos = 0;
  let n = chunks.length;

  for (let i = 0; i < n; ++i) {
    const c = chunks[i];
    const l = loops[i];

    const b = pos;
    if (l) to[pos++] = 0;
    if (c) {
      if (c < 3) {
        for (let i = 0; i < c; ++i) to[pos++] = 0;
      }
      else {
        for (let i = 0; i < c - 2; ++i) to[pos++] = i + 1;
        to[pos++] = 0;
        to[pos++] = 0;
      }
    }
    if (l) {
      to[pos++] = 0;
      to[pos++] = 0;
    }
    
    if (lookup) for (let j = b; j < pos; ++j) lookup[j] = i;
  }

  while (pos < to.length) to[pos++] = 0;
}

export const copyNumberArrayRepeatedRange = (
  from: NumberArray | number, to: NumberArray,
  fromIndex: number, toIndex: number,
  dims: number, count: number, loop: boolean = false, offset: number = 0,
) => {
  let pos = toIndex;
  const read = fromIndex;

  if (loop) count += 3;
  const array = from as NumberArray;

  if (typeof from === 'number' && dims === 1) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = from + offset;
    }
  }
  else if (dims === 1) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read] + offset;
    }
  }
  else if (dims === 2) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read] + offset;
      to[pos++] = array[read + 1] + offset;
    }
  }
  else if (dims === 3) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read] + offset;
      to[pos++] = array[read + 1] + offset;
      to[pos++] = array[read + 2] + offset;
    }
  }
  else if (dims === 3.5) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read] + offset;
      to[pos++] = array[read + 1] + offset;
      to[pos++] = array[read + 2] + offset;
      pos++; // !
    }
  }
  else if (dims === 4) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read] + offset;
      to[pos++] = array[read + 1] + offset;
      to[pos++] = array[read + 2] + offset;
      to[pos++] = array[read + 3] + offset;
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    for (let j = 0; j < count; ++j) {
      for (let k = 0; k < dims; ++k) {
        to[pos++] = array[read + k] + offset;
      }
    }
  }
}

export const copyNumberArrayChunked = (
  from: NumberArray, to: NumberArray, dims: number,
  chunks: number[], loops: boolean[] = NO_LOOPS, offsets?: number[],
) => {
  let pos = 0;

  const c = chunks.length;
  const n = from.length / dims;
  const getOffset = offsets ? (i: number) => offsets[i] : () => 0;

  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        to[pos++] = from[read] + offset;
      }
    }
  }
  else if (dims === 2) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        to[pos] = from[read] + offset;
        to[pos + 1] = from[read + 1] + offset;
        pos += 2;
      }
    }
  }
  else if (dims === 3) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        to[pos] = from[read] + offset;
        to[pos + 1] = from[read + 1] + offset;
        to[pos + 2] = from[read + 2] + offset;
        pos += 3;
      }
    }
  }
  else if (dims === 3.5) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        to[pos] = from[read] + offset;
        to[pos + 1] = from[read + 1] + offset;
        to[pos + 2] = from[read + 2] + offset;
        pos += 4;
      }
    }
  }
  else if (dims === 4) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        to[pos] = from[read] + offset;
        to[pos + 1] = from[read + 1] + offset;
        to[pos + 2] = from[read + 2] + offset;
        to[pos + 3] = from[read + 3] + offset;
        pos += 4;
      }
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const read = i * dims;
      for (let j = 0; j < d; ++j) {
        for (let k = 0; k < dims; ++k) {
          to[pos + k] = from[read + k] + offset;
        }
        pos += dims;
      }
    }
  }
}

export const copyDataArrayChunked = (
  from: any[], to: NumberArray, dims: number,
  accessor: Accessor,
  chunks: number[], loops: boolean[] = NO_LOOPS, offsets?: number[],
) => {
  const n = from.length;
  const getOffset = offsets ? (i: number) => offsets[i] : () => 0;

  let base = 0;
  let j = 0;
  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]) + offset;
      for (let k = 0; k < d; ++k) {
        to[j++] = v;
      }
    }
  }
  else if (dims === 2) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]);
      for (let k = 0; k < d; ++k) {
        to[j] = v[0] + offset;
        to[j + 1] = v[1] + offset;
        j += 2;
      }
    }
  }
  else if (dims === 3) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]);
      for (let k = 0; k < d; ++k) {
        to[j] = v[0] + offset;
        to[j + 1] = v[1] + offset;
        to[j + 2] = v[2] + offset;
        j += 3;
      }
    }
  }
  else if (dims === 3.5) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]);
      for (let k = 0; k < d; ++k) {
        to[j] = v[0] + offset;
        to[j + 1] = v[1] + offset;
        to[j + 2] = v[2] + offset;
        j += 4; // !
      }
    }
  }
  else if (dims === 4) {
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]);
      for (let k = 0; k < d; ++k) {
        to[j] = v[0] + offset;
        to[j + 1] = v[1] + offset;
        to[j + 2] = v[2] + offset;
        to[j + 3] = v[3] + offset;
        j += 4;
      }
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    let j = 0;
    for (let i = 0; i < n; ++i) {
      const l = loops[i];
      let c = chunks[i];
      let d = c + 3 * +!!l;

      const offset = getOffset(i);
      const v = accessor(from[i]);
      for (let k = 0; k < d; ++k) {
        for (let l = 0; l < dims; ++l) {
          to[j + l] = v[l] + offset;
        }
        j += dims;
      }
    }
  }
}

export const copyNumberArraysComposite = (
  from: (NumberArray[] | NumberArray)[], to: NumberArray, dims: number,
  chunks: number[], loops: boolean[] = NO_LOOPS, offsets?: number[],
) => {
  let pos = 0;
  const n = chunks.length;

  const el = from[0][0];
  const isNested = el && !(typeof el === 'number') && (typeof el[0] === 'number');
  const getOffset = offsets ? (i: number) => offsets[i] : () => 0;

  const dims3 = toDims3(dims);
  const dims4 = Math.ceil(dims);

  if (!isNested) {
    for (let i = 0; i < n; ++i) {
      const c = chunks[i];
      const l = loops[i];

      const offset = getOffset(i);
      const range3 = c * dims3;
      const range4 = c * dims4;
      const src = from[i] as NumberArray;

      if (l) {
        copyNumberArrayRange(src, to, range3 - dims3, pos, dims3, dims, offset);
        copyNumberArrayRange(src, to, 0, pos + dims4, range3, dims, offset);
        copyNumberArrayRange(src, to, 0, pos + range4 + dims4, dims3 * 2, dims, offset);
        pos += (c + 3) * dims4;
      }
      else {
        copyNumberArrayRange(src, to, 0, pos, range3, dims, offset);
        pos += c * dims4;
      }
    }
  }
  else {
    for (let i = 0; i < n; ++i) {
      const c = chunks[i];
      const l = loops[i];

      const offset = getOffset(i);
      const range4 = c * dims4;
      const src = from[i] as NumberArray[];

      if (l) {
        copyNestedNumberArrayRange(src, to, c - 1, pos, 1, dims, offset);
        copyNestedNumberArrayRange(src, to, 0, pos + dims4, c, dims, offset);
        copyNestedNumberArrayRange(src, to, 0, pos + range4 + dims4, 2, dims, offset);
        pos += (c + 3) * dims4;
      }
      else {
        copyNestedNumberArrayRange(src, to, 0, pos, c, dims, offset);
        pos += c * dims4;
      }
    }
  }
}

export const copyDataArraysComposite = (
  from: any[], to: NumberArray, dims: number,
  accessor: Accessor, 
  chunks: number[], loops: boolean[] = NO_LOOPS, offsets?: number[],
) => {
  let pos = 0;
  const n = from.length;

  const el = accessor(from[0])[0];
  const isNested = el && !(typeof el === 'number') && (typeof el[0] === 'number');
  const getOffset = offsets ? (i: number) => offsets[i] : () => 0;

  const dims3 = toDims3(dims);
  const dims4 = Math.ceil(dims);

  if (!isNested) {
    for (let i = 0; i < n; ++i) {
      const c = chunks[i];
      const l = loops[i];

      const offset = getOffset(i);
      const range3 = c * dims3;
      const range4 = c * dims4;
      const src = accessor(from[i]) as NumberArray;

      if (l) {
        copyNumberArrayRange(src, to, range3 - dims3, pos, dims3, dims, offset);
        copyNumberArrayRange(src, to, 0, pos + dims4, range3, dims, offset);
        copyNumberArrayRange(src, to, 0, pos + range4 + dims4, dims * 2, dims, offset);
        pos += (c + 3) * dims4;
      }
      else {
        copyNumberArrayRange(src, to, 0, pos, range3, dims, offset);
        pos += c * dims4;
      }
    }
  }
  else {
    for (let i = 0; i < n; ++i) {
      const c = chunks[i];
      const l = loops[i];

      const offset = getOffset(i);
      const range4 = c * dims4;
      const src = accessor(from[i]) as NumberArray[];

      if (l) {
        copyNestedNumberArrayRange(src, to, c - 1, pos, 1, dims, offset);
        copyNestedNumberArrayRange(src, to, 0, pos + dims4, c, dims, offset);
        copyNestedNumberArrayRange(src, to, 0, pos + range4 + dims4, 2, dims, offset);
        pos += (c + 3) * dims4;
      }
      else {
        copyNestedNumberArrayRange(src, to, 0, pos, c, dims, offset);
        pos += c * dims4;
      }
    }
  }
}

export const copyNumberArrayCompositeRange = (
  from: (NumberArray[] | NumberArray), to: NumberArray,
  fromIndex: number, toIndex: number,
  dims: number, count: number, loop: boolean = false, offset: number = 0,
) => {
  let pos = toIndex;

  const el = (from as NumberArray[])[0][0];
  const isNested = el && !(typeof el === 'number') && (typeof el[0] === 'number');

  const dims3 = toDims3(dims);
  const dims4 = Math.ceil(dims);

  if (!isNested) {
    const range3 = count * dims3;
    const range4 = count * dims4;
    const src = from as NumberArray;

    if (loop) {
      copyNumberArrayRange(src, to, fromIndex + range3 - dims3, pos, dims, dims, offset);
      copyNumberArrayRange(src, to, fromIndex, pos + dims4, range3, dims, offset);
      copyNumberArrayRange(src, to, fromIndex, pos + range4 + dims4, dims * 2, dims, offset);
    }
    else {
      copyNumberArrayRange(src, to, fromIndex, pos, range3, dims, offset);
    }
  }
  else {
    const range4 = count * dims4;
    const src = from as NumberArray[];

    if (loop) {
      copyNestedNumberArrayRange(src, to, fromIndex + count - 1, pos, 1, dims, offset);
      copyNestedNumberArrayRange(src, to, fromIndex, pos + dims4, count, dims, offset);
      copyNestedNumberArrayRange(src, to, fromIndex, pos + range4 + dims4, 2, dims, offset);
    }
    else {
      copyNestedNumberArrayRange(src, to, fromIndex, pos, count, dims, offset);
    }
  }
}

export const getBoundingBox = (data: NumberArray, dims: number): DataBoundingBox => {
  const n = data.length / dims;
  
  if (dims === 1) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; ++i) {
      const d = data[i];
      min = Math.min(min, d);
      max = Math.max(max, d);
    }
    return [[min], [max]];
  }

  if (dims === 2) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 2) {
      const dx = data[j];
      const dy = data[j + 1];
      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);
    }
    return [[minX, minY], [maxX, maxY]];
  }

  if (dims === 3) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 3) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];

      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);

      minZ = Math.min(minZ, dz);
      maxZ = Math.max(maxZ, dz);
    }
    return [[minX, minY, minZ], [maxX, maxY, maxZ]];
  }

  if (dims === 4) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    let minZ = Infinity;
    let maxZ = -Infinity;

    let minW = Infinity;
    let maxW = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 4) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];
      const dw = data[j + 3];

      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);

      minZ = Math.min(minZ, dz);
      maxZ = Math.max(maxZ, dz);

      minW = Math.min(minW, dw);
      maxW = Math.max(maxW, dw);
    }
    return [[minX, minY, minZ, minW], [maxX, maxY, maxZ, maxW]];
  }

  const min = seq(dims).map(_ => Infinity);
  const max = seq(dims).map(_ => -Infinity);
  for (let i = 0, j = 0; i < n; ++i, j += dims) {
    for (let k = 0; k < dims; ++k) {
      const d = data[j];

      min[k] = Math.min(min[k], d);
      max[k] = Math.max(max[k], d);
    }
  }

  return [min, max];
};

export const extendBoundingBox = (box: DataBoundingBox, data: NumberArray, dims: number) => {
  const n = data.length / dims;
  const [min, max] = box;
  
  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const d = data[i];
      min[0] = Math.min(min[0], d);
      max[0] = Math.max(max[0], d);
    }
    return;
  }

  if (dims === 2) {
    for (let i = 0, j = 0; i < n; ++i, j += 2) {
      const dx = data[j];
      const dy = data[j + 1];
      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);
    }
    return;
  }

  if (dims === 3) {
    for (let i = 0, j = 0; i < n; ++i, j += 3) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];

      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);

      min[2] = Math.min(min[2], dz);
      max[2] = Math.max(max[2], dz);
    }
    return;
  }

  if (dims === 4) {
    for (let i = 0, j = 0; i < n; ++i, j += 4) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];
      const dw = data[j + 3];

      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);

      min[2] = Math.min(min[2], dz);
      max[2] = Math.max(max[2], dz);

      min[3] = Math.min(min[3], dw);
      max[3] = Math.max(max[3], dw);
    }
    return;
  }

  for (let i = 0, j = 0; i < n; ++i, j += dims) {
    for (let k = 0; k < dims; ++k) {
      const d = data[j];

      min[k] = Math.min(min[k], d);
      max[k] = Math.max(max[k], d);
    }
  }

  return;
};

export const toDataBounds = (box: DataBoundingBox): DataBounds => {
  const [min, max] = box;
  const dims = min.length;

  if (dims === 1) {
    return {
      center: [(min[0] + max[0]) / 2],
      radius: (max[0] - min[0]) / 2,
      min,
      max,
    };
  }

  if (dims === 2) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy);
    
    return {center: [cx, cy], radius: d, min, max};
  }

  if (dims === 3) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;
    const cz = (min[2] + max[2]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const dz = (max[2] - min[2]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    return {center: [cx, cy, cz], radius: d, min, max};
  }

  if (dims === 4) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;
    const cz = (min[2] + max[2]) / 2;
    const cw = (min[3] + max[3]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const dz = (max[2] - min[2]) / 2;
    const dw = (max[3] - min[3]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    
    return {center: [cx, cy, cz, cw], radius: d, min, max};
  }

  return {
    center: min.map((v: number, i: number) => (v + max[i]) / 2),
    radius: Math.sqrt(
      min
      .map((v: number, i: number) => (max[i] - v) / 2)
      .map((v: number) => v * v)
      .reduce((a: number, b: number) => a + b, 0)
    ),
    min,
    max,
  };
};

