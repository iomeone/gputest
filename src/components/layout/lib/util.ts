import { LiveElement } from '@use-gpu/live/types';
import { SpanData } from '@use-gpu/text/types';
import { Point, Rectangle, Gap, Margin, Alignment, Anchor, Dimension, LayoutRenderer, InlineRenderer } from '../types';

export const parseDimension = (x: string | number | null | undefined, total: number, snap: boolean = false): number => {
  if (typeof x === 'number') return snap ? Math.round(x) : x;
  if (x == null) return snap ? Math.round(total) : total;

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

export const parseBase = (x: string): number | null => {
  const isBase = (x === 'base');
    return isBase ? null : parseAnchor(x);
}

export const normalizeAlignment = (x: Alignment | [Alignment, Alignment]): [Alignment, Alignment] =>
  !Array.isArray(x)
    ? [x, x] as [Alignment, Alignment]
    : x;

export const normalizeAnchor = (x: Anchor | [Anchor, Anchor]): [Anchor, Anchor] =>
  !Array.isArray(x)
    ? [x, x] as [Anchor, Anchor]
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

export const makeInlineLayout = (
  ranges: Point[],
  //sizes: Point[],
  offsets: Point[],
  renders: InlineRenderer[],
) => (
  box: Rectangle
) => {
  let [left, top, right, bottom] = box;
  const out = [] as LiveElement<any>[];
  const n = ranges.length;

  for (let i = 0; i < n; ++i) {
    const range = ranges[i];
    //const size = sizes[i];
    const offset = offsets[i];
    const render = renders[i];

    const l = left + offset[0];
    const t = top + offset[1];
    const r = l;// + size[0];
    const b = t;// + size[1];

    const layout = [l, t, r, b] as Rectangle;
    const el = render(layout, range[0], range[1], offset[2]);

    if (Array.isArray(el)) out.push(...(el as any[]));
    else out.push(el);
  }

  return out;
};

export const makeGlyphLayout = (
  box: Rectangle,
  spanData: SpanData,
) => {
  const {forSpans, getStart, getEnd} = spanData;

  const out = [] as LiveElement<any>[];
  

  let caret = 0;
  forSpans((hard, advance, trim, index) => {
    
    console.log('render', content.slice(getStart(index), getEnd(index)), 'at', layout[0], layout[1]);
  }, startIndex, endIndex);

  return out;
};

