import type { LiveElement } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Point, Point4, Rectangle } from '@use-gpu/core';
import type { LayoutRenderer, LayoutPicker, RenderInside, RenderOutside, RenderInline, InlineRenderer, InlineLine, UIAggregate } from './types';

import { memoArgs, yeet, fragment, use, useFiber, useMemo, useNoMemo } from '@use-gpu/live';
import { bindBundle, chainTo } from '@use-gpu/shader/wgsl';
import { getCombinedClip, getTransformedClip } from '@use-gpu/wgsl/layout/clip.wgsl';
import { INSPECT_STYLE } from './lib/constants';

const NO_OBJECT: any = {};

const sameBox = (a: [any, any, any, any], b: [any, any, any, any]) => {
  return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]) && (a[3] === b[3]);
};

type Layout<T> = (
  inside: RenderInside,
  outside: RenderOutside,
  inspect?: boolean,
) => T;

type LayoutArgs<T> = Parameters<Layout<T>>;

export const memoLayout = <T>(f: Layout<T>, name?: string): Layout<T> => {
  return memoArgs(f, ([ai, ao, an]: LayoutArgs<T>, [bi, bo, bn]: LayoutArgs<T>) => (
    ai === bi &&
    an === bn &&
    sameBox(ao.box, bo.box) &&
    sameBox(ao.origin, bo.origin) &&
    ao.clip === bo.clip &&
    ao.mask === bo.mask &&
    ao.transform === bo.transform
  ), name);
}

export const BoxLayout = memoLayout((
  inside: RenderInside,
  outside: RenderOutside,
  inspect?: boolean,
) => {
  const {sizes, offsets, renders, clip, mask, transform, inverse} = inside;
  const {box, origin, clip: parentClip, mask: parentMask, transform: parentTransform} = outside;
  
  const [left, top, right, bottom] = box;
  const out = [] as LiveElement[];
  const n = sizes.length;

  const xmask = parentMask && mask ? useMemo(
    () => chainTo(parentMask, mask),
    [parentMask, mask],
  ) : (useNoMemo(), parentMask ?? mask ?? null);

  const xform = parentTransform && transform ? useMemo(
    () => chainTo(parentTransform, transform),
    [parentTransform, transform],
  ) : (useNoMemo(), parentTransform ?? transform ?? null);

  const xclip = parentClip ? (
    transform
    ? useMemo(
        () => bindBundle(
          clip ? getCombinedClip : getTransformedClip,
          {
            getParent: parentClip,
            getSelf: clip ?? null,
            applyTransform: inverse ?? null,
          }
        ),
        [clip, parentClip, inverse]
      )
    : (useNoMemo(), parentClip ?? null)
  ) : (useNoMemo(), clip ?? null);

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
    const el = render(layout, origin, xclip, xmask, xform);

    if (Array.isArray(el)) {
      if (el.length > 1) out.push(fragment(el as any[]));
      else out.push(el[0] as any);
    }
    else out.push(el);
  }

  if (inspect) {
    let i = 0;
    const next = () => useFiber().id.toString() + '-' + i++;
    const yeets = [] as UIAggregate[];
    yeets.push({
      id: next(),
      rectangle: box,
      uv: [0, 0, 1, 1],
      count: 1,
      repeat: 0,
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
        transform: xform,
        bounds: layout,
        ...INSPECT_STYLE.child,
      });
    }

    out.push(yeet(yeets));
  }
  
  if (out.length === 1 && Array.isArray(out[0])) return out[0];
  return out;
}, 'BoxLayout');

export const InlineLayout = (
  inline: RenderInline,
  outside: RenderOutside,
  inspect?: boolean,
) => {
  let {ranges, sizes, offsets, renders, key} = inline;
  const {box, origin, clip, mask, transform} = outside;

  let [left, top, right, bottom] = box;
  
  const n = ranges.length;

  let last: InlineRenderer | null = null;
  let lines: InlineLine[] = [];
  let hash = miniHash(key || -1, miniHash(left, top));

  const out: LiveElement[] = [];
  const flush = (render: InlineRenderer) => {
    const el = render(lines, origin, clip!, mask!, transform!, hash);
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

  if (inspect) {
    let i = 0;
    const next = () => useFiber().id.toString() + '-' + i++;
    const yeets = [] as UIAggregate[];
    yeets.push({
      id: next(),
      rectangle: box,
      uv: [0, 0, 1, 1],
      count: 1,
      repeat: 0,
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
        transform,
        bounds: layout,
        ...INSPECT_STYLE.child
      });
    }
  
    out.push(yeet(yeets));
  }

  return out;
};

const rot = (a: number, b: number) => ((a << b) | (a >>> (32 - b))) >>> 0;
export const miniHash = (state: number, x: number) => {
  const i = Math.round(x);
  const f = Math.round((i - x) * 0x7FFFFFFF);
  state = rot(Math.imul(state, 0xc2b2ae35) ^ i, 5);
  state = rot(Math.imul(state, 0x85ebca6b) ^ f, 11);
  return state;
}
