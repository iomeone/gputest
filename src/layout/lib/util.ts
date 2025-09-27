import type { LiveElement } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Point, Point4, Rectangle } from '@use-gpu/core';
import type { FitInto, AutoPoint, Direction, Gap, MarginLike, Margin, Alignment, Anchor, Dimension, LayoutRenderer, LayoutPicker, InlineRenderer, InlineLine, UIAggregate } from '../types';

import { yeet, fragment } from '@use-gpu/live';
import { toMurmur53 } from '@use-gpu/state';
import { bindBundle, chainTo } from '@use-gpu/shader/wgsl';
import { getCombinedClip, getTransformedClip } from '@use-gpu/wgsl/layout/clip.wgsl';
import { INSPECT_STYLE } from './constants';

export const isHorizontal = (d: Direction) => d === 'x' || d === 'lr' || d === 'rl';
export const isVertical = (d: Direction) => d === 'y' || d === 'tb' || d === 'bt';
export const isFlipped = (d: Direction) => d === 'rl' || d === 'bt';

const sameBox = (a: [any, any, any, any], b: [any, any, any, any]) => {
  return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]) && (a[3] === b[3]);
};

type Fitter<T> = (into: FitInto) => T;
export const memoFit = <T>(f: Fitter<T>): Fitter<T> => {
  let last: FitInto | undefined;
  let value: T | null = null;
  return (into: FitInto) => {
    if (last && sameBox(last, into)) {
      return value!;
    }
    value = f(into);
    last = into;
    return value;
  };
}

type Layout<T> = (
  box: Rectangle,
  clip?: ShaderModule,
  transform?: ShaderModule,
) => T;
export const memoLayout = <T>(f: Layout<T>): Layout<T> => {
  let lastBox: Rectangle | undefined;
  let lastClip: ShaderModule | undefined;
  let lastTransform: ShaderModule | undefined;

  let value: T | null = null;
  return (
    box: Rectangle,
    clip?: ShaderModule,
    transform?: ShaderModule,
  ) => {
    if (lastBox && sameBox(lastBox, box) && lastClip === clip && lastTransform === transform) {
      return value!;
    }
    value = f(box, clip, transform);
    lastBox = box;
    lastClip = clip;
    lastTransform = transform;
    return value;
  };
}

type Inline<T> = (
  lines: InlineLine[],
  clip?: ShaderModule,
  transform?: ShaderModule,
) => T;
export const memoInline = <T>(f: Inline<T>): Inline<T> => {
  let lastHash: number | undefined;
  let lastClip: ShaderModule | undefined;
  let lastTransform: ShaderModule | undefined;

  let value: T | null = null;
  return (
    lines: InlineLine[],
    clip?: ShaderModule,
    transform?: ShaderModule,
    version?: number,
  ) => {
    const hash = version ?? toMurmur53(lines);
    if (lastHash && lastHash === hash && lastClip === clip && lastTransform === transform) {
      return value!;
    }
    value = f(lines, clip, transform);
    lastHash = hash;
    lastClip = clip;
    lastTransform = transform;
    return value;
  };
}

export const mergePadding = (a: Point4, b: Point4) => {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

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
  clip?: ShaderModule,
  transform?: ShaderModule,
  inverse?: ShaderModule,
  update?: (r: Rectangle) => void,
) => (
  box: Rectangle,
  parentClip?: ShaderModule,
  parentTransform?: ShaderModule,
) => {
  const [left, top, right, bottom] = box;
  const out = [] as LiveElement<any>[];
  const n = sizes.length;

  if (update) update(box);

  const xform = parentTransform && transform ? chainTo(parentTransform, transform) : parentTransform ?? transform;
  const xclip = parentClip ? (
    transform
    ? bindBundle(
        clip ? getCombinedClip : getTransformedClip,
        {
          getParent: parentClip,
          getSelf: clip ?? null,
          applyTransform: inverse ?? null,
        }
      )
    : parentClip
  ) : clip;

  for (let i = 0; i < n; ++i) {
    const size = sizes[i];
    const offset = offsets[i];
    const render = renders[i];

    const w = size[0];
    const h = size[1];

    const l = left + offset[0];
    const t = top + offset[1];
    const r = l + w;
    const b = t + h;
    
    const layout = [l, t, r, b] as Rectangle;
    const el = render(layout, xclip, xform);

    if (Array.isArray(el)) {
      if (el.length > 1) out.push(fragment(el as any[]));
      else out.push(el[0] as any);
    }
    else out.push(el);
  }
  
  if (out.length === 1 && Array.isArray(out[0])) return out[0];
  return out;
};

export const makeBoxInspectLayout = (
  id: number,
  sizes: Point[],
  offsets: Point[],
  renders?: LayoutRenderer[],
  clip?: ShaderModule,
  transform?: ShaderModule,
  inverse?: ShaderModule,
  update?: (r: Rectangle) => void,
) => (
  box: Rectangle,
  parentClip?: ShaderModule,
  parentTransform?: ShaderModule,
) => {
  let out = renders ? makeBoxLayout(sizes, offsets, renders, clip, transform, inverse, update)(box, parentClip, parentTransform) : [];
  
  const xform = parentTransform && transform ? chainTo(parentTransform, transform) : parentTransform ?? transform;
  const xclip = parentClip ? (
    transform
    ? bindBundle(
        clip ? getCombinedClip : getTransformedClip,
        {
          getParent: parentClip,
          getSelf: clip ?? null,
          applyTransform: inverse ?? null,
        }
      )
    : parentClip
  ) : clip;

  let i = 0;
  const next = () => id.toString() + '-' + i++;
  const yeets = [] as UIAggregate[];
  yeets.push({
    id: next(),
    rectangle: box,
    uv: [0, 0, 1, 1],
    count: 1,
    repeat: 0,
    clip: parentClip,
    transform: parentTransform,
    bounds: box,
    ...INSPECT_STYLE.parent,
  });

  const [left, top] = box;
  const n = sizes.length;
  for (let i = 0; i < n; ++i) {
    const size = sizes[i];
    const offset = offsets[i];

    const w = size[0];
    const h = size[1];

    const l = left + offset[0];
    const t = top + offset[1];
    const r = l + w;
    const b = t + h;
    const layout = [l, t, r, b] as Rectangle;

    yeets.push({
      id: next(),
      rectangle: layout,
      uv: [0, 0, 1, 1],
      count: 1,
      repeat: 0,
      clip: xclip,
      transform: xform,
      bounds: layout,
      ...INSPECT_STYLE.child,
    });
  }
  
  out = [...out, yeet(yeets)];
  return out;
}

export const makeInlineLayout = (
  ranges: Point[],
  sizes: Point[],
  offsets: [number, number, number][],
  renders: InlineRenderer[],
  key?: number,
) => (
  box: Rectangle,
  clip?: ShaderModule,
  transform?: ShaderModule,
) => {
  let [left, top, right, bottom] = box;
  const n = ranges.length;

  let last: InlineRenderer | null = null;
  let lines: InlineLine[] = [];

  let miniHash = makeMiniHash();
  miniHash(key);
  miniHash(left);
  key = miniHash(top);
  
  const out: LiveElement<any>[] = [];
  const flush = (render: InlineRenderer) => {
    const el = render(lines, clip, transform, key);
    if (Array.isArray(el)) out.push(...(el as any[]));
    else out.push(el);

    lines = [];
  };
  
  for (let i = 0; i < n; ++i) {
    const range = ranges[i];
    const size = sizes[i];
    const offset = offsets[i];
    const render = renders[i];

    const [x, y, gap] = offset;
    const l = left + x;
    const t = top + y;
    const r = l + size[0];
    const b = t + size[1];

    const layout = [l, t, r, b] as Rectangle;
    const [start, end] = range;

    if (last !== render) {
      if (last) flush(last);
      last = render;
    }

    lines.push({layout, start, end, gap});
  }

  if (last) flush(last);

  return out;
};

export const makeInlineInspectLayout = (
  id: number,
  ranges: Point[],
  sizes: Point[],
  offsets: [number, number, number][],
  renders?: InlineRenderer[],
  key?: number,
) => (
  box: Rectangle,
  clip?: ShaderModule,
  transform?: ShaderModule,
) => {
  let out = renders ? makeInlineLayout(ranges, sizes, offsets, renders, key)(box, clip, transform) : [];

  let i = 0;
  const next = () => id.toString() + '-' + i++;
  const yeets = [] as UIAggregate[];
  yeets.push({
    id: next(),
    rectangle: box,
    uv: [0, 0, 1, 1],
    count: 1,
    repeat: 0,
    clip,
    transform,
    bounds: box,
    ...INSPECT_STYLE.parent,
  });

  const [left, top] = box;
  const n = ranges.length;
  for (let i = 0; i < n; ++i) {
    const range = ranges[i];
    const size = sizes[i];
    const offset = offsets[i];

    const [x, y, gap] = offset;
    const l = left + x;
    const t = top + y;
    const r = l + size[0];
    const b = t + size[1];

    const layout = [l, t, r, b] as Rectangle;

    yeets.push({
      id: next(),
      rectangle: layout,
      uv: [0, 0, 1, 1],
      count: 1,
      repeat: 0,
      clip,
      transform,
      bounds: layout,
      ...INSPECT_STYLE.child
    });
  }
  
  out = [...out, yeet(yeets)];
  return out;
};

export const makeBoxPicker = (
  id: number,
  sizes: Point[],
  offsets: Point[],
  pickers: (LayoutPicker | null | undefined)[],
  scrollPos?: Point,
  onScroll?: (dx: number, dy: number) => void,
  pickable: boolean = true,
) => (
  x: number,
  y: number,
  l: number,
  t: number,
  r: number,
  b: number,
  scroll: boolean = false,
): [
  number,
  Rectangle,
  ((dx: number, dy: number) => void) | undefined,
] | null => {
  const n = sizes.length;

  if (x < l || x > r || y < t || y > b) return null;

  for (let i = n - 1; i >= 0; --i) {
    const size = sizes[i];
    const offset = offsets[i];
    const pick = pickers[i];

    const [w, h] = size;

    let [ll, tt] = offset;
    ll += l;
    tt += t;

    if (scrollPos) {
      ll -= scrollPos[0];
      tt -= scrollPos[1];
    }

    let rr = ll + w;
    let bb = tt + h;
    
    const sub = pick && pick(x, y, ll, tt, rr, bb, scroll);
    if (sub) return sub;
  }

  return pickable && (!scroll || onScroll) ? [id, [l, t, r, b], onScroll] : null;
};

export const intersectRange = (minA: number, maxA: number, minB: number, maxB: number) => !(minA >= maxB || minB >= maxA);

export const overlapBounds = (a: Rectangle, b: Rectangle): boolean => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;

  return intersectRange(al, ar, bl, br) && intersectRange(at, ab, bt, bb);
}

export const joinBounds = (a: Rectangle, b: Rectangle): Rectangle => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;
  return [
    Math.min(al, bl),
    Math.min(at, bt),
    Math.max(ar, br),
    Math.max(ab, bb),
  ] as Rectangle;
};

export const intersectBounds = (a: Rectangle, b: Rectangle): Rectangle => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;
  return [
    Math.max(al, bl),
    Math.max(at, bt),
    Math.min(ar, br),
    Math.min(ab, bb),
  ] as Rectangle;
};

const rot = (a: number, b: number) => ((a << b) | (a >>> (32 - b))) >>> 0;
export const makeMiniHash = (key: number = 1) => (x?: number) => {
  if (x != null) {
    const i = Math.round(x);
    const f = Math.round((i - x) * 0x7FFFFFFF);
    key = rot(Math.imul(key, 0xc2b2ae35) ^ i, 5);
    key = rot(Math.imul(key, 0x85ebca6b) ^ f, 11);
  }
  return key;
}

// Alignment to relative anchor position [0...1]
export const getAlignmentAnchor = (x: Alignment): number => {
  const isStart = (x === 'start' || x === 'justify-start');
  const isEnd = (x === 'end' || x === 'justify-end');

  const align = isStart ? 0 : isEnd ? 1 : 0.5;
  return align;
}

// Alignment/justification spacing and indent
export const getAlignmentSpacing = (
  slack: number,
  n: number,
  hard: boolean,
  align: Alignment,
) => {
  let gap = 0;
  let lead = 0;

  const isJustifyStart  = align === 'justify-start';
  const isJustifyCenter = align === 'justify-center';
  const isJustifyEnd    = align === 'justify-end';

  const isJustify = align === 'justify' ||
                    ((isJustifyStart || isJustifyCenter || isJustifyEnd) && !hard);
  const isBetween = align === 'between';
  const isEvenly  = align === 'evenly';

  if (slack > 0) {
    if (isEvenly || isBetween || isJustify) {
      if (n === 1) {
        lead = slack / 2;
      }
      else if (isEvenly) {
        gap = Math.max(0, slack / (n + 1));
        lead = gap;
      }
      else if (isBetween) {
        gap = Math.max(0, slack / n);
        lead = gap / 2;
      }
      else if (isJustify) {
        gap = Math.max(0, slack / Math.max(1, n - 1));
      }
    }
    else {
      lead = getAlignmentAnchor(align) * slack;
    }
  }

  return [gap, lead];
};
