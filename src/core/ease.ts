import { makeTuples } from './tuple';

const sqr = (x: number) => x * x;
const cub = (x: number) => x * x * x;
const cmp = (a: number, b: number) => a - b;

// Cubic bezier 1D
export const cubicBezier = (t: number, a: number, b: number, c: number, d: number) =>
  a * cub(1 - t) + 3 * b * sqr(1 - t) * t + 3 * c * (1 - t) * sqr(t) + d * cub(t);

// Cubic bezier 1D derivative
export const cubicBezierDt = (t: number, a: number, b: number, c: number, d: number) =>
  a * (- 3*sqr(1 - t)) +
  b * ((9*t - 12)*t + 3) +
  c * (6 - 9*t) * t +
  d * 3*sqr(t);

// Invert monotonous cubic bezier
export const cubicBezierInverse = (v: number, a: number, b: number, c: number, d: number) => {
  const min = Math.min(a, b, c, d);
  const max = Math.max(a, b, c, d);

  const n = 4;
  let t = (v - min) / (max - min);
  t -= t * (.5 - t) * (t - 1);

  for (let i = 0; i < n; ++i) {
    t = t - (cubicBezier(t, a, b, c, d) - v) / cubicBezierDt(t, a, b, c, d);
  }
  return t;
}

// Cubic bezier ease, X = time / Y = value
// Only control points (x1,y1) and (x2,y2) are adjustable ([0..1], any)
export const bezierEase = (t: number, x1: number, y1: number, x2: number, y2: number) => {
  const s = cubicBezierInverse(t, 0, x1, x2, 1);
  const value = cubicBezier(s, 0, y1, y2, 1);
  return value;
};

// Catmull-rom spline with movable knots
export const catmullRom = (
  t: number,
  t0: number,
  t1: number,
  t2: number,
  t3: number,
  a: number,
  b: number,
  c: number,
  d: number,
) => {
  let dt0 = t - t0;

  let d10 = t1 - t0;
  let d1t = t1 - t;
  let d20 = t2 - t0;
  let d21 = t2 - t1;
  let d2t = t2 - t;
  let d31 = t3 - t1;
  let d32 = t3 - t2;
  let d3t = t3 - t;

  let a1 = (d10 !== 0) ? a * (d1t / d10) + b * (dt0 / d10) : (a + b) / 2;
  let a2 = (d21 !== 0) ? b * (d2t / d21) + c * (-d1t / d21) : (b + c) / 2;
  let a3 = (d32 !== 0) ? c * (d3t / d32) + d * (-d2t / d32) : (c + d) / 2;

  let b1 = (d20 !== 0) ? a1 * (d2t / d20) + a2 * (dt0 / d20) : (a1 + a2) / 2;
  let b2 = (d31 !== 0) ? a2 * (d3t / d31) + a3 * (-d1t / d31) : (a2 + a3) / 2;

  let v  = (d21 !== 0) ? b1 * (d2t / d21) + b2 * (-d1t / d21) : (b1 + b2) / 2;

  return v;
}

// Centripetal catmull rom 1D
export const centripetalCatmullRom = (
  t: number,
  a: number,
  b: number,
  c: number,
  d: number,
) => {
  const d1 = Math.sqrt(Math.abs(a - b));
  const d2 = Math.sqrt(Math.abs(b - c));
  const d3 = Math.sqrt(Math.abs(c - d));
  
  const t0 = -d1;
  const t1 = 0;
  const t2 = d2;
  const t3 = d2 + d3;
  
  return catmullRom(t * d2, t0, t1, t2, t3, a, b, c, d);
}

type DistanceMap = {
  map: Float32Array,
  count: number,
  length: number,
};

export const makeDistanceMap = (
  measure: (t1: number, t2: number) => number,
  tolerance: number = 0.01,
) => {

  let n = 0;
  let accum = 0;
  let eps = Math.pow(2, Math.ceil(Math.log2(tolerance)));

  const data: number[] = [-measure(-eps, 0), -eps, 0];
  const range = (a: number, b: number, l: number, force: number) => {
    const m = (a + b) / 2;
    const l1 = measure(a, m);
    const l2 = measure(m, b);
    const d = l1 + l2;

    if (force > 0 || (l / d < 1 - tolerance)) {
      range(a, m, l1, force - 1);
      range(m, b, l2, force - 1);
    }
    else {
      n++;
      const r = l / d;
      accum += d / (1 + r) * 2;
      data.push(a);
      data.push(accum);
    }
  };
  
  range(0, 1, measure(0, 1), 2);
  data.push(1);
  data.push(accum + measure(1, 1 + eps));
  data.push(1 + eps);

  const dbg = [];
  for (let i = 0; i <= n + 2; ++i) dbg.push(data[i * 2 + 1] * 256);

  const count = n;
  const length = accum;
  const map = new Float32Array(data);

  return {map, count, length};
};

export const queryDistanceMap = (dm: DistanceMap, value: number) => {
  const {map, count} = dm;
  
  let a = 1;
  let b = count;
  let limit = 10;
  
  while (b > a && limit-- > 0) {
    const m = b - ((b - a) >> 1);
    const d = map[m * 2];
    if (d > value) b = m - 1;
    else a = m;
  }
  
  let a2 = a * 2;

  let d0 = map[a2 - 2];
  let t0 = map[a2 - 1];

  let d1 = map[a2];
  let t1 = map[a2 + 1];

  let d2 = map[a2 + 2];
  let t2 = map[a2 + 3];

  let d3 = map[a2 + 4];
  let t3 = map[a2 + 5];

  return catmullRom(value, d0, d1, d2, d3, t0, t1, t2, t3);
}
