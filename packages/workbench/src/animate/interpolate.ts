import { lerp } from '@use-gpu/core';

const sqr = (x: number) => x * x;

export const makeValueRef = (v: number[][] | number[] | TypedArray | number) => {
  const vs = v as number[];
  if (typeof vs[0] === 'number') return new Float32Array([...vs]);
  if (typeof v === 'number') return v;
  return JSON.parse(JSON.stringify(v));
}

export const copyValue = (
  values: Record<string, number | number[] | number[][] | Float32Array>,
  prop: string,
  v: number[][] | number[] | Float32Array | number,
) => {
  const vs = v as number[];
  const vvs = v as number[][];

  if (typeof v === 'number') values[prop] = v as number;
  else if (typeof vs[0] === 'number') {
    const target = values[prop] as number[];
    const n = target.length;
    for (let i = 0; i < n; ++i) target[i] = vs[i];
  }
  else if (typeof vvs[0][0] === 'number') {
    const target = values[prop] as number[][];
    const n = target.length;
    for (let i = 0; i < n; ++i) {
      const vv = vvs[i];
      const tt = target[i];
      const m = tt.length;
      for (let j = 0; j < m; ++j) {
        tt[j] = vv[j];
      }
    }
  }
  else {
    throw new Error(`Cannot copy value for ${prop} '${a}' '${b}'`);
  }
};

export const interpolateValue = (
  values: Record<string, number | number[] | number[][] | Float32Array>,
  prop: string,
  a: number[][] | number[] | Float32Array | number,
  b: number[][] | number[] | Float32Array | number,
  t: number,
) => {
  const as = a as number[];
  const bs = b as number[];
  const aas = a as number[][];
  const bbs = b as number[][];

  if (typeof a === 'number') values[prop] = lerp(a as number, b as number, t);
  else if (typeof as[0] === 'number') {
    const target = values[prop] as number[];
    const n = target.length;
    for (let i = 0; i < n; ++i) target[i] = lerp(as[i], bs[i], t);
  }
  else if (typeof aas[0][0] === 'number') {
    const target = values[prop] as number[][];
    const n = target.length;
    for (let i = 0; i < n; ++i) {
      const aa = aas[i];
      const bb = bbs[i];
      const tt = target[i];
      const m = tt.length;
      for (let j = 0; j < m; ++j) {
        tt[j] = lerp(aa[j], bb[j], t);
      }
    }
  }
  else {
    throw new Error(`Cannot interpolate value for ${prop} '${a}' '${b}'`);
  }
};

export const distanceValue = (
  a: number[][] | number[] | Float32Array | number,
  b: number[][] | number[] | Float32Array | number,
) => {
  const as = a as number[];
  const bs = b as number[];
  const aas = a as number[][];
  const bbs = b as number[][];

  if (typeof a === 'number') return Math.abs(a - b);
  else if (typeof as[0] === 'number') {
    const n = as.length;
    let d = 0;
    for (let i = 0; i < n; ++i) d += sqr(as[i] - bs[i]);
    return Math.sqrt(d);
  }
  else if (typeof aas[0][0] === 'number') {
    const n = aas.length;

    let d = 0;
    for (let i = 0; i < n; ++i) {
      const aa = aas[i];
      const bb = bbs[i];
      const tt = target[i];
      const m = tt.length;
      for (let j = 0; j < m; ++j) {
        d += sqr(aa[j] - bb[j]);
      }
    }
    return Math.sqrt(d);
  }
  else {
    throw new Error(`Cannot calculate distance for '${a}' '${b}'`);
  }
};
