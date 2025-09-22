import { LiveElement } from '@use-gpu/live/types';
import { Point, Rectangle, Gap, Margin, Alignment, Anchor, LayoutRenderer } from '../types';

export const parseDimension = (x: string | number, total: number, snap?: boolean = false): number => {
  if (typeof x === 'number') return snap ? Math.round(x) : x;

  let v;
  const s = x as string;
  if (s[s.length - 1] === '%') {
    v = +s.slice(0, -1) / 100 * total;
  }
  else {
    v = +s;
  }

  return snap ? Math.round(v) : v;
}

export const parseAnchor = (x: string): number => {
  const isStart = (x === 'start');
  const isEnd = (x === 'end');

  const align = isStart ? 0 : isEnd ? 1 : 0.5;
  return align;
}

export const normalizeAlignment = (x: Alignment | [Alignment, Alignment]): [Alignment, Alignment] =>
  !Array.isArray(x)
    ? [x, x] as [Alignment, Alignment]
    : x;

export const normalizeMargin = (m: number | Margin): Margin =>
  !Array.isArray(m)
    ? [m, m, m, m] as Margin
    : m;

export const normalizeGap = (g: number | Gap): Gap =>
  !Array.isArray(g)
    ? [g, g] as Gap
    : g;

export const mergeMargin = (a: number, b: number) => {
  if (a >= 0 && b >= 0) return Math.max(a, b);
  if (a >= 0) return a + b;
  if (b >= 0) return b + a;
  return Math.min(a, b);
}

export const makeBoxLayout = (
  sizes: Point[],
  offsets: Point[],
  renders: LayoutRenderer[],
) => (
  box: Rectangle
) => {
  let [left, top, right, bottom] = box;
  const out = [] as LiveElement<any>[];
  const n = sizes.length;

  for (let i = 0; i < n; ++i) {
    const size = sizes[i];
    const offset = offsets[i];
    const render = renders[i];

    const l = left + offset[0];
    const t = top + offset[1];
    const r = l + size[0];
    const b = t + size[1];

    const layout = [l, t, r, b] as Rectangle;
    const el = render(layout);

    if (Array.isArray(el)) out.push(...(el as any[]));
    else out.push(el);
  }

  return out;
};
