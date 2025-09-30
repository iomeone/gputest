import type { Emitter, Writer, Emit, TypedArray, FieldArray, TensorArray, VectorLike, UniformType } from './types';

import { getUniformArrayType, getUniformArrayDepth, getUniformDims, getUniformAlign, toCPUDims, toGPUDims } from './uniform';
import { isTypedArray } from './buffer';

type NumberMapper = (x: number) => number;

const IDENTITY = (x: number) => x;

export const getTensorLength = (size: VectorLike) => (size as number[]).reduce((a, b) => a * b, 1);

export const alignSizeTo = (n: number, align: number) => Math.ceil(n / align) * align;

export const makeRawArray = (byteSize: number) => new ArrayBuffer(byteSize);

export const makeCPUArray = (type: UniformType, length: number): FieldArray => {
  const ctor  = getUniformArrayType(type);
  const dims  = getUniformDims(type);
  const depth = getUniformArrayDepth(type);

  const n = length * toCPUDims(dims);

  const array = new ctor(n);
  return {format: type, array, dims, depth, length};
};

export const makeGPUArray = (type: UniformType, length: number): FieldArray => {
  const ctor  = getUniformArrayType(type);
  const dims  = getUniformDims(type);
  const depth = getUniformArrayDepth(type);
  const align = getUniformAlign(type);

  const n = alignSizeTo(length * toGPUDims(dims), align || 4);

  const array = new ctor(n);
  return {format: type, array, dims, depth, length};
};

export const makeTensorArray = (type: UniformType, size: number | number[]): TensorArray => {
  const ctor  = getUniformArrayType(type);
  const dims  = getUniformDims(type);

  const d = toCPUDims(dims);
  const scalar = typeof size === 'number';
  const length = !scalar ? size.reduce((a, b) => a * b, 1) : size;

  const n = length * d;
  const array = new ctor(n);
  return {array, dims: d, length, size: !scalar ? size : [length], format: type};
};

export const toTensorArray = (type: UniformType, data: TypedArray, size?: VectorLike): TensorArray => {
  const dims  = getUniformDims(type);

  const d = toCPUDims(dims);

  const length = (data.length / dims)|0;
  return {array: data, dims: d, length, size: size ?? [length], format: type};
};

export const castRawArray = (buffer: ArrayBuffer | TypedArray, type: UniformType) => {
  const ctor = getUniformArrayType(type);
  const dims = getUniformDims(type);

  const array = new ctor((buffer as TypedArray).buffer ?? buffer);
  return {array, dims};
};

// Copy packed scalar/vec2/vec3/vec4 with vec3-to-vec4 extension for WGSL.
// Extends to matrix types via repetition.
export const makeCopyPipe = ({
  index = IDENTITY,
  map = IDENTITY,
}: {
  index?: NumberMapper,
  map?: NumberMapper,
} = {}) => (
  from: VectorLike | number,
  to: TypedArray,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromIndex: number = 0,
  toIndex: number = 0,
  count?: number,
  stride?: number,
) => {

  const n = count ?? (((from as VectorLike).length ?? 1) / fromDims);
  const step = stride ?? toDims;

  const f = fromIndex;
  let t = toIndex;

  if (step !== toDims || fromDims !== toDims || index != IDENTITY)  {

    // repeat n writes of a vec4
    const dims4 = Math.min(toDims, 4);
    const repeat = Math.ceil(toDims / 4);

    if (dims4 < 4 && fromDims !== toDims) throw new Error(`Unsupported copy pipe dimensions: ${fromDims} -> ${toDims}`);

    if (typeof from === 'number') {
      for (let i = 0; i < n; ++i) {
        to[t] = from;
        for (let j = 1; j < toDims; ++j) to[t + j] = 0;
        t += step;
      }
    }
    else if (dims4 === 1) {
      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < repeat; ++j) {
          const b = f + index(i);
          to[t + j] = map(from[b]);
        }
        t += step;
      }
    }
    else if (dims4 === 2) {
      for (let i = 0; i < n; ++i) {
        const b = f + index(i) * 2;
        to[t    ] = map(from[b]);
        to[t + 1] = map(from[b + 1]);
        t += step;
      }
    }
    else if (dims4 === 3) {
      for (let i = 0; i < n; ++i) {
        const b = f + index(i) * 3;
        to[t    ] = map(from[b]);
        to[t + 1] = map(from[b + 1]);
        to[t + 2] = map(from[b + 2]);
        t += step;
      }
    }
    else if (dims4 === 4) {
      if (fromDims !== toDims) {
        // vec3to4 extension
        if (repeat > 1) {
          for (let i = 0; i < n; ++i) {
            const b = f + index(i) * 3 * repeat; // !
            for (let j = 0; j < repeat; ++j) {
              const bb = b + j * 3;
              const tt = t + j * 4;
              to[tt    ] = map(from[bb]);
              to[tt + 1] = map(from[bb + 1]);
              to[tt + 2] = map(from[bb + 2]);
              to[tt + 3] = 0; // unused
            }
            t += step;
          }
        }
        else {
          for (let i = 0; i < n; ++i) {
            const b = f + index(i) * 3; // !
            to[t    ] = map(from[b]);
            to[t + 1] = map(from[b + 1]);
            to[t + 2] = map(from[b + 2]);
            to[t + 3] = 0; // unused
            t += step;
          }
        }
      }
      else {
        if (repeat > 1) {
          for (let i = 0; i < n; ++i) {
            const b = f + index(i) * 4 * repeat;
            for (let j = 0; j < repeat; ++j) {
              const j4 = j * 4;
              const tt = t + j4;
              const bb = b + j4;
              to[tt    ] = map(from[bb]);
              to[tt + 1] = map(from[bb + 1]);
              to[tt + 2] = map(from[bb + 2]);
              to[tt + 3] = map(from[bb + 3]);
            }
            t += step;
          }
        }
        else {
          for (let i = 0; i < n; ++i) {
            const b = f + index(i) * 4;
            to[t    ] = map(from[b]);
            to[t + 1] = map(from[b + 1]);
            to[t + 2] = map(from[b + 2]);
            to[t + 3] = map(from[b + 3]);
            t += step;
          }
        }
      }
    }
  }
  else if (map !== IDENTITY) {
    const nd = n * toDims;

    if (typeof from === 'number') {
      for (let i = 0; i < n; ++i) {
        to[t] = map(from);
        for (let j = 1; j < toDims; ++j) to[t + j] = 0;
        t += toDims;
      }
    }
    else {
      const b = t;
      for (let i = 0; i < nd; ++i) {
        to[b + i] = map(from[f + i]);
      }
    }
  }
  else {
    const nd = n * toDims;

    if (typeof from === 'number') {
      for (let i = 0; i < n; ++i) {
        to[t] = from;
        for (let j = 1; j < toDims; ++j) to[t + j] = 0;
        t += toDims;
      }
    }
    else {
      const b = t;
      for (let i = 0; i < nd; ++i) {
        to[b + i] = from[f + i];
      }
    }
  }

  return n * step;
};

export const copyRawNumberArray = (
  from: VectorLike,
  to: VectorLike,
  dims: number = 1,
  fromIndex: number = 0,
  toIndex: number = 0,
  count?: number,
) => {
  const n = count ?? ((from.length ?? 1) / dims);

  const f = fromIndex;
  let t = toIndex;

  const nd = n * dims;

  if (typeof from === 'number') {
    for (let i = 0; i < n; ++i) {
      to[t] = from;
      for (let j = 1; j < dims; ++j) to[t + j] = 0;
      t += dims;
    }
  }
  else {
    const b = t;
    for (let i = 0; i < nd; ++i) {
      to[b + i] = from[f + i];
    }
  }

  return nd;
}

export const copyNumberArray = makeCopyPipe();

export const unweldNumberArray = (() => {
  let arg: VectorLike;
  const index = (i: number) => arg[i];
  const copyWithIndex = makeCopyPipe({index});
  return (
    from: VectorLike | number,
    to: TypedArray,
    indices: VectorLike,
    fromDims: number = 1,
    toDims: number = fromDims,
    fromIndex: number = 0,
    toIndex: number = 0,
    count?: number,
    stride?: number,
  ) => {
    arg = indices;
    return copyWithIndex(from, to, fromDims, toDims, fromIndex, toIndex, count, stride);
  }
})();

export const offsetNumberArray = (() => {
  let arg: number;
  const map = (x: number) => x + arg;
  const copyWithOffset = makeCopyPipe({map});
  return (
    from: VectorLike | number,
    to: TypedArray,
    offset: number = 0,
    fromDims: number = 1,
    toDims: number = fromDims,
    fromIndex: number = 0,
    toIndex: number = 0,
    count?: number,
    stride?: number,
  ) => {
    arg = offset;
    return copyWithOffset(from, to, fromDims, toDims, fromIndex, toIndex, count, stride);
  };
})();

export const fillNumberArray = (() => {
  const index = () => 0;
  const copyWithZeroIndex = makeCopyPipe({index});
  return (
    from: VectorLike | number,
    to: TypedArray,
    fromDims: number = 1,
    toDims: number = fromDims,
    fromIndex: number = 0,
    toIndex: number = 0,
    count: number,
    stride?: number,
  ) => {
    if (typeof from === 'number') {
      const step = stride || toDims;

      let t = toIndex;

      if (toDims === 1) {
        for (let j = 0; j < count; ++j) {
          to[t] = from;
          t += step;
        }
      }
      else {
        const skip = toDims - 1;

        for (let j = 0; j < count; ++j) {
          to[t] = from;
          for (let k = 1; k <= skip; ++k) to[t + k] = 0;
          t += step;
        }
      }

      return count * step;
    }
    else {
      return copyWithZeroIndex(from, to, fromDims, toDims, fromIndex, toIndex, count, stride);
    }
  }
})();

export const spreadNumberArray = (
  from: VectorLike | number | null,
  to: TypedArray,
  slices: VectorLike,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromIndex: number = 0,
  toIndex: number = 0,
  stride?: number,
) => {
  const step = stride || toDims;

  const n = slices.length;
  let f = fromIndex;
  let t = toIndex;
  for (let i = 0; i < n; ++i) {
    const l = slices[i];
    fillNumberArray(from ?? i, to, fromDims, toDims, f, t, l, stride);
    f += fromDims;
    t += l * step;
  }
  return t - toIndex;
}

// Copy from any-nested 1d/2d/3d/4d number[] with array depth known ahead of time
export const copyRecursiveNumberArray = (
  from: VectorLike | VectorLike[] | number,
  to: TypedArray,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromDepth: number = 0,
  toIndex: number = 0,
  w: number = 0,
): number => {
  if (isTypedArray(from)) fromDepth = 0;
  if (typeof from != 'number' && from.length === 0) return 0;

  if (fromDepth === 0) {
    if (typeof from === 'number') {
      // Scalar
      return fillNumberArray(from, to, fromDims, toDims, 0, toIndex, 1);
    }
    else if (typeof from[0] === 'number') {
      // Vector
      if (fromDims === toDims) return copyRawNumberArray(from as VectorLike, to, toDims, 0, toIndex, from.length / fromDims);
      return copyNumberArray(from as VectorLike, to, fromDims, toDims, 0, toIndex, from.length / fromDims);
    }
  }
  else if (fromDepth === 1 && Array.isArray(from)) {
    if (typeof from[0] === 'number') {
      // Scalar array or flattened vectors
      return copyNumberArray(from as VectorLike, to, fromDims, toDims, 0, toIndex, from.length / fromDims);
    }
    if (typeof from[0][0] === 'number') {
      // Vector array or flattened multivectors
      return copyNestedNumberArray(from as VectorLike[], to, fromDims, toDims, 0, toIndex, from.length, w);
    }
  }
  else if (fromDepth >= 2 && Array.isArray(from)) {
    const n = from.length;
    let b = 0;
    for (let i = 0; i < n; ++i) {
      const l = copyRecursiveNumberArray(from[i], to, fromDims, toDims, fromDepth - 1, toIndex + b, w);
      b += l;
    }
    return b;
  }
  throw new Error("Unexpected array depth");
};

// Copy from 1d/2d/3d/4d number[][] into 1d/2d/3d/4d typed array, with specified w coordinate
export const copyNestedNumberArray = (
  from: VectorLike[],
  to: TypedArray,
  fromDims: number,
  toDims: number,
  fromIndex: number = 0,
  toIndex: number = 0,
  count?: number,
  w: number = 0,
): number => {
  const n = count ?? from.length;

  const s = fromIndex;
  let o = toIndex;

  if (toDims === 1) {
    for (let i = 0; i < n; ++i) {
      const [a] = from[s + i];
      to[o++] = a;
    }
  }
  else if (toDims === 2) {
    if (fromDims === 1) {
      for (let i = 0; i < n; ++i) {
        const [a] = from[s + i];
        to[o    ] = a;
        to[o + 1] = 0;
        o += 2;
      }
    }
    else {
      for (let i = 0; i < n; ++i) {
        const [a, b] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        o += 2;
      }
    }
  }
  else if (toDims === 3) {
    if (fromDims === 1) {
      for (let i = 0; i < n; ++i) {
        const [a] = from[s + i];
        to[o    ] = a;
        to[o + 1] = 0;
        to[o + 2] = 0;
        o += 3;
      }
    }
    else if (fromDims === 2) {
      for (let i = 0; i < n; ++i) {
        const [a, b] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        to[o + 2] = 0;
        o += 3;
      }
    }
    else {
      for (let i = 0; i < n; ++i) {
        const [a, b, c] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        to[o + 2] = c;
        o += 3;
      }
    }
  }
  else if (toDims === 4) {
    if (fromDims === 1) {
      for (let i = 0; i < n; ++i) {
        const [a] = from[s + i];
        to[o    ] = a;
        to[o + 1] = 0;
        to[o + 2] = 0;
        to[o + 3] = w;
        o += 4;
      }
    }
    else if (fromDims === 2) {
      for (let i = 0; i < n; ++i) {
        const [a, b] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        to[o + 2] = 0;
        to[o + 3] = w;
        o += 4;
      }
    }
    else if (fromDims === 3) {
      for (let i = 0; i < n; ++i) {
        const [a, b, c] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        to[o + 2] = c;
        to[o + 3] = w;
        o += 4;
      }
    }
    else {
      for (let i = 0; i < n; ++i) {
        const [a, b, c, d] = from[s + i];
        to[o    ] = a;
        to[o + 1] = b;
        to[o + 2] = c;
        to[o + 3] = d;
        o += 4;
      }
    }
  }
  else {
    throw new Error(`Unsupported nested number array dimensions: ${fromDims} -> ${toDims}`);
  }

  return n * toDims;
};

export const makeSpreadEmitter = (
  from: VectorLike | number,
  slices: VectorLike,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromIndex: number = 0,
) => (
  to: TypedArray,
  toIndex: number = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  count: number = 0,
  stride?: number,
) => spreadNumberArray(from, to, slices, fromDims, toDims, fromIndex, toIndex, stride);

export const makeUnweldEmitter = (
  from: VectorLike | number,
  indices: VectorLike,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromIndex: number = 0,
) => (
  to: TypedArray,
  toIndex: number = 0,
  count?: number,
  stride?: number,
) => unweldNumberArray(from, to, indices, fromDims, toDims, fromIndex, toIndex, count, stride);

export const toUnweldedArray = (
  from: VectorLike | number,
  indices: VectorLike,
  fromDims: number = 1,
  toDims: number = fromDims,
  fromIndex: number = 0,
  toIndex: number = 0,
  count?: number,
  stride?: number,
) => {
  const ctor = (from.constructor ?? Float32Array) as any;
  const to = new ctor(indices.length * toDims);
  unweldNumberArray(from, to, indices, fromDims, toDims, fromIndex, toIndex, count, stride);
  return to;
};

export const makeNumberWriter = (to: VectorLike, dims: number, fields?: number[], stride?: number): {
  emit: Emit,
  emitted: () => number,
  reset: () => void,
} => {
  let i = 0;
  let f = 0;
  const d = toGPUDims(dims);
  const emitted = () => i / d;
  const reset = () => { i = 0; f = 0; }
  let emit;

  const step = stride ?? d;

  if (fields && fields?.length > 1) {
    const n = fields.length;

    if      (dims === 1)   emit = (a: number) => {
      to[i + fields[f++]] = a;
      if (f === n) { f = 0; i += step; }
    };
    else if (dims === 2)   emit = (a: number, b: number) => {
      const o = i + fields[f++];
      to[o    ] = a;
      to[o + 1] = b;
      if (f === n) { f = 0; i += step; }
    };
    else if (dims === 3)   emit = (a: number, b: number, c: number) => {
      const o = i + fields[f++];
      to[o    ] = a;
      to[o + 1] = b;
      to[o + 2] = c;
      if (f === n) { f = 0; i += step; }
    };
    else if (dims === 3.5) emit = (a: number, b: number, c: number) => {
      const o = i + fields[f++];
      to[o    ] = a;
      to[o + 1] = b;
      to[o + 2] = c;
      to[o + 3] = 0;
      if (f === n) { f = 0; i += step; }  // !
    };
    else if (dims === 4)   emit = (a: number, b: number, c: number, d: number) => {
      const o = i + fields[f++];
      to[o    ] = a;
      to[o + 1] = b;
      to[o + 2] = c;
      to[o + 3] = d;
      if (f === n) { f = 0; i += step; }
    };

    if (dims !== d) throw new Error(`Unsupported expr emitter dims ${dims}`);

    return {
      reset,
      emitted,
      emit: emit ?? ((...args: number[]) => {
        const o = i + fields[f++];
        const n = args.length;
        for (let j = 0; j < n; ++j) to[o + j] = args[j];
        if (f === n) { f = 0; i += step; }
      }),
    };
  }
  else {
    if      (dims === 1)   emit = (a: number) => { to[i++] = a; };
    else if (dims === 2)   emit = (a: number, b: number) => { to[i] = a; to[i + 1] = b; i += 2; };
    else if (dims === 3)   emit = (a: number, b: number, c: number) => { to[i] = a; to[i + 1] = b; to[i + 2] = c; i += 3 };
    else if (dims === 3.5) emit = (a: number, b: number, c: number) => { to[i] = a; to[i + 1] = b; to[i + 2] = c; i += 4; }; // !
    else if (dims === 4)   emit = (a: number, b: number, c: number, d: number) => { to[i] = a; to[i + 1] = b; to[i + 2] = c; to[i + 3] = d; i += 4; };

    if (dims !== d) throw new Error(`Unsupported expr emitter dims ${dims}`);

    return {
      reset,
      emitted,
      emit: emit ?? ((...args: number[]) => {
        const n = args.length;
        for (let j = 0; j < n; ++j) to[i + j] = args[j];
        i += step;
      }),
    };
  }
}

export const makeNumberSplitter = (to: VectorLike[], dims: number) => {
  const n = to.length;
  let i = 0;

  const writers = to.map((t) => makeNumberWriter(t, dims));
  const emits = writers.map(({emit}) => emit);
  const emit: Emit = ((a: number, b: number, c: number, d: number) => emits[i++ % n](a, b, c, d)) as any as Emit;

  return {
    reset: () => writers.forEach(writer => writer.reset()),
    emitted: writers[0].emitted,
    emit,
  };
};

export const makeNumberReader = (from: VectorLike, dims: number) => {
  const d = toCPUDims(dims);

  const reader = (
    (d === 1) ? (emit: Emit, i: number) => { emit(from[i]) } :
    (d === 2) ? (emit: Emit, i: number) => { const i2 = i*2; emit(from[i2], from[i2+1]); } :
    (d === 3) ? (emit: Emit, i: number) => { const i3 = i*3; emit(from[i3], from[i3+1], from[i3+2]); } :
    (d === 4) ? (emit: Emit, i: number) => { const i4 = i*4; emit(from[i4], from[i4+1], from[i4+2], from[i4+3]); } :
    null
  );
  if (!reader) throw new Error(`Unsupported reader dims '${dims}'`);

  return reader;
};

export const emitArray = <T>(
  expr: Emitter,
  writer: Writer,
  length: number,
  props?: T,
) => {
  const {emit, emitted} = writer;
  for (let i = 0; i < length; i++) expr(emit, i, props);
  return emitted();
};

export const emitMultiArray = <T>(
  expr: Emitter,
  writer: Writer,
  length: number,
  size: number[],
  props?: T,
) => {
  const n = size.length;
  const {emit, emitted} = writer;

  if (n === 1) {
    for (let i = 0; i < length; i++) {
      expr(emit, i, props);
    }
  }
  else if (n === 2) {
    const [w, h] = size;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        expr(emit, i, j, props);
      }
    }
  }
  else if (n === 3) {
    const [w, h, d] = size;
    for (let k = 0; k < d; k++) {
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          expr(emit, i, j, k, props);
        }
      }
    }
  }
  else if (n === 4) {
    const [w, h, d, s] = size;
    for (let l = 0; l < s; l++) {
      for (let k = 0; k < d; k++) {
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            expr(emit, i, j, k, l, props);
          }
        }
      }
    }
  }
  else {
    const index = size.map(() => 0);
    const increment = () => {
      for (let i = 0; i < n; ++i) {
        const c = index[i];
        if (c === size[i] - 1) index[i] = 0;
        else {
          index[i] = c + 1;
          break;
        }
      }
    };

    for (let i = 0; i < length; i++) {
      expr(emit, ...index, props);
      increment();
    }
  }

  return emitted();
}