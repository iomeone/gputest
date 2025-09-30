// Binary dot-like operator
export const binary = (f: (a: number, b: number) => number) => (a: number[], b: number[]) => {
  const {length} = a;
  const c = a.slice();
  for (let i = 0; i < length; ++i) {
    c[i] = f(a[i], b[i]);
  }
  return c;
}

// Unary reduction operator
export const reduce = (f: (a: number, b: number, i: number) => number) => (v: number[], accum: number = 0) => {
  const {length} = v;
  for (let i = 0; i < length; ++i) {
    accum = f(accum, v[i], i);
  }
  return accum;
}

// Binary reduction operator
export const reduce2 = (f: (a: number, b: number, c: number, i: number) => number) => (a: number[], b: number[], accum: number = 0) => {
  const {length} = a;
  for (let i = 0; i < length; ++i) {
    accum = f(accum, a[i], b[i], i);
  }
  return accum;
}

// Scalar operators
export const plus     = (x: number, y: number) => x + y;
export const minus    = (x: number, y: number) => x - y;
export const multiply = (x: number, y: number) => x * y;
export const divide   = (x: number, y: number) => x / y;
export const minimum  = (x: number, y: number) => Math.min(x, y);
export const maximum  = (x: number, y: number) => Math.max(x, y);

export const plus2  = (x: number, y: number) => x + y*y;
export const mad    = (x: number, y: number, z: number) => x + y*z;
export const madl2  = (x: number, y: number, z: number) => x + (y - z) * (y - z);

// Vector operators
export const add    = binary(plus);
export const sub    = binary(minus);
export const mul    = binary(multiply);
export const div    = binary(divide);
export const dot    = reduce2(mad);
export const adds   = (a: number[], s: number) => a.map(x => x + s);
export const subs   = (a: number[], s: number) => a.map(x => x - s);
export const muls   = (a: number[], s: number) => a.map(x => x * s);
export const scale  = muls;

export const sum    = reduce(plus);
export const len2   = reduce(plus2);
export const len    = (a: number[]) => Math.sqrt(len2(a));
export const dist2  = reduce2(madl2);
export const dist   = (a: number[], b: number[]) => Math.sqrt(dist2(a, b));

export const abs    = (a: number[]) => a.map(x => Math.abs(x));
export const unit   = (a: number[]) => {
  const l = len(a);
  return scale(a, l ? 1/l : 0);
};

export const minel  = (a: number[])    => reduce(minimum)(a, Infinity);
export const maxel  = (a: number[])    => reduce(maximum)(a, -Infinity);

export const min    = (a: number[], b: number[]) => a.map((_, i) => Math.min(a[i], b[i]));
export const max    = (a: number[], b: number[]) => a.map((_, i) => Math.max(a[i], b[i]));
export const clamp  = (vector: number[], a: number = 0, b: number = 1) => vector.map(v => Math.max(a, Math.min(b, v)));

export const mins   = (a: number[], b: number) => a.map((_, i) => Math.min(a[i], b));
export const maxs   = (a: number[], b: number) => a.map((_, i) => Math.max(a[i], b));

export const lerp    = (a: number[], b: number[], t: number) => add(a, scale(sub(b, a), t));
export const project = (a: number[], n: number[]) => sub(a, scale(n, dot(a, n)));
export const select  = (a: number[], b: number[], m: number[]) => m.map((s, i) => s ? b[i] : a[i]);

export const circle = (a: number, r: number = 1) => [r*Math.cos(a), r*Math.sin(a)];

export const seq = (n: number, s: number = 0, t: number = 1) => [...new Array(n)].map((_, i) => s + i * t);
