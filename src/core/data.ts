import type { TypedArray, UniformType, UniformAttribute, Emitter, Emit, Accessor, AccessorSpec } from './types';
import { UNIFORM_ARRAY_TYPES, UNIFORM_ARRAY_DIMS } from './constants';

import { vec4 } from 'gl-matrix';

type NumberArray = TypedArray | number[];

const NO_LOOPS = [] as boolean[];
const NO_ENDS = [] as [boolean, boolean][];

export const alignSizeTo = (n: number, s: number) => {
  let f = n % s;
  return f === 0 ? n : n + (s - f);
};

export const makeDataArray = (type: UniformType, length: number) => {
  const ctor = UNIFORM_ARRAY_TYPES[type];
  let dims = UNIFORM_ARRAY_DIMS[type];

  const array = new ctor(alignSizeTo(length * Math.ceil(dims), 4));
  return {array, dims};
};

export const makeDataEmitter = (to: NumberArray, dims: number): {
  emit: Emit,
  emitted: () => number,
} => {
  let i = 0;
  const emitted = () => i / Math.ceil(dims);

  if (dims === 1)   return {emitted, emit: (a: number) => { to[i++] = a; }};
  if (dims === 2)   return {emitted, emit: (a: number, b: number) => { to[i++] = a; to[i++] = b; }};
  if (dims === 3)   return {emitted, emit: (a: number, b: number, c: number) => { to[i++] = a; to[i++] = b; to[i++] = c; }};
  if (dims === 3.5) return {emitted, emit: (a: number, b: number, c: number) => { to[i++] = a; to[i++] = b; to[i++] = c; i++; }}; // !
  if (dims === 4)   return {emitted, emit: (a: number, b: number, c: number, d: number) => { to[i++] = a; to[i++] = b; to[i++] = c; to[i++] = d; }};
  return {
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
  for (let i = 0; i < n; i++) expr(emit, i, n, props);
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
      expr(emit, index[0], size[0], props);
      increment();
    };
  }
  else if (n === 2) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], size[0], size[1], props);
      increment();
    };
  }
  else if (n === 3 || n === 3.5) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], index[2], size[0], size[1], size[2], props);
      increment();
    };
  }
  else if (n === 4) {
    nest = (emit: Emit) => {
      expr(emit, index[0], index[1], index[2], index[3], size[0], size[1], size[2], size[3], props);
      increment();
    };
  }
  else {
    nest = (emit: Emit) => {
      expr(emit, ...index, ...size, props);
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
      if (Number.isNaN(flat[o-1])) debugger;
      flat[o++] = from[j + 1];
      if (Number.isNaN(flat[o-1])) debugger;
      flat[o++] = from[j + 2];
      if (Number.isNaN(flat[o-1])) debugger;
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
  else {
    const n = Math.min(from.length, to.length);
    for (let i = 0; i < n; ++i) to[i] = from[i];
  }
}

export const copyNumberArrays = (from: NumberArray[], to: NumberArray, dims: number = 1) => {
  let pos = 0;
  const n = from.length;
  const dims3 = Math.floor(dims);
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
      to[toIndex + j++] = from[fromIndex + i++];
      to[toIndex + j++] = from[fromIndex + i++];
      to[toIndex + j++] = from[fromIndex + i++];
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
  const dims3 = Math.floor(dims);
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
  dims: number, count: number, loop: boolean = false,
) => {
  let pos = toIndex;
  const read = fromIndex;

  if (loop) count += 3;
  const array = from as NumberArray;

  if (typeof from === 'number' && dims === 1) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = from;
    }
  }
  else if (dims === 1) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read];
    }
  }
  else if (dims === 2) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read];
      to[pos++] = array[read + 1];
    }
  }
  else if (dims === 3) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read];
      to[pos++] = array[read + 1];
      to[pos++] = array[read + 2];
    }
  }
  else if (dims === 3.5) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read];
      to[pos++] = array[read + 1];
      to[pos++] = array[read + 2];
      pos++; // !
    }
  }
  else if (dims === 4) {
    for (let j = 0; j < count; ++j) {
      to[pos++] = array[read];
      to[pos++] = array[read + 1];
      to[pos++] = array[read + 2];
      to[pos++] = array[read + 3];
    }
  }
  else {
    // TBD
    console.warn('Dims > 4 not supported');
    for (let j = 0; j < count; ++j) {
      for (let k = 0; k < dims; ++k) {
        to[pos++] = array[read + k];
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

  const dims3 = Math.floor(dims);
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

  const dims3 = Math.floor(dims);
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
  dims: number, count: number, loop: boolean = false,
) => {
  let pos = toIndex;

  const el = (from as NumberArray[])[0][0];
  const isNested = el && !(typeof el === 'number') && (typeof el[0] === 'number');

  const dims3 = Math.floor(dims);
  const dims4 = Math.ceil(dims);

  if (!isNested) {
    const range3 = count * dims3;
    const range4 = count * dims4;
    const src = from as NumberArray;

    if (loop) {
      copyNumberArrayRange(src, to, fromIndex + range3 - dims3, pos, dims, dims);
      copyNumberArrayRange(src, to, fromIndex, pos + dims4, range3, dims);
      copyNumberArrayRange(src, to, fromIndex, pos + range4 + dims4, dims * 2, dims);
    }
    else {
      copyNumberArrayRange(src, to, fromIndex, pos, range3, dims);
    }
  }
  else {
    const range4 = count * dims4;
    const src = from as NumberArray[];

    if (loop) {
      copyNestedNumberArrayRange(src, to, fromIndex + count - 1, pos, 1, dims);
      copyNestedNumberArrayRange(src, to, fromIndex, pos + dims4, count, dims);
      copyNestedNumberArrayRange(src, to, fromIndex, pos + range4 + dims4, 2, dims);
    }
    else {
      copyNestedNumberArrayRange(src, to, fromIndex, pos, count, dims);
    }
  }
}
