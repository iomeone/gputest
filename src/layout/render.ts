import type { LiveElement } from '@use-gpu/live';
import type { Rectangle } from '@use-gpu/core';
import type { RenderInside, RenderOutside, RenderInline, InlineRenderer, InlineLine, UIAggregate } from './types';

import { memoArgs, yeet, useMemo, useNoMemo } from '@use-gpu/live';
import { bindBundle, chainTo } from '@use-gpu/shader/wgsl';
import { schemaToArchetype } from '@use-gpu/core';
import { UI_SCHEMA, LayerReconciler } from '@use-gpu/workbench';

import { getCombinedClip, getTransformedClip } from '@use-gpu/wgsl/layout/clip.wgsl';
import { INSPECT_STYLE } from './lib/constants';

const {quote} = LayerReconciler;

const sameBox = (a: [any, any, any, any], b: [any, any, any, any]) => {
  return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]) && (a[3] === b[3]);
};

type Render<T> = (
  inside: RenderInside,
  outside: RenderOutside,
  inspect?: boolean,
) => T;

type RenderArgs<T> = Parameters<Render<T>>;

export const memoRender = <T>(f: Render<T>, name?: string): Render<T> => {
  return memoArgs(f, ([ai, ao, an]: RenderArgs<T>, [bi, bo, bn]: RenderArgs<T>) => (
    ai === bi &&
    an === bn &&
    sameBox(ao.box, bo.box) &&
    sameBox(ao.origin, bo.origin) &&
    ao.clip === bo.clip &&
    ao.mask === bo.mask &&
    ao.transform === bo.transform &&
    ao.ref === bo.ref
  ), name);
};

export const BoxLayout = memoRender((
  inside: RenderInside,
  outside: RenderOutside,
  inspect?: boolean,
) => {
  const {sizes, offsets, renders, clip, mask, transform, inverse} = inside;
  const {box, origin, z, clip: parentClip, mask: parentMask, transform: parentTransform, ref} = outside;

  const [left, top] = box;
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

  const render = ref?.(box, origin);
  if (render) out.push(render);

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
    const el = render(layout, origin, z, xclip, xmask, xform);

    if (Array.isArray(el)) for (const e of el) out.push(e);
    else if (el) out.push(el);
  }

  if (inspect) {
    const yeets = [] as UIAggregate[];

    const attributes = {
      rectangle: box,
      uv: [0, 0, 1, 1],
      repeat: 0,
      ...INSPECT_STYLE.parent,
    };

    yeets.push({
      count: 1,
      archetype: schemaToArchetype(UI_SCHEMA, attributes),

      attributes,
      transform: parentTransform,
      bounds: box,
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

      const attributes = {
        rectangle: layout,
        uv: [0, 0, 1, 1],
        repeat: 0,
        ...INSPECT_STYLE.child,
      };

      yeets.push({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),

        attributes,
        transform: xform,
        bounds: layout,
      });
    }

    out.push(quote(yeet(yeets)));
  }

  return out.length ? out.length === 1 ? out[0] : out : null;
}, 'BoxLayout');

export const InlineLayout = (
  inline: RenderInline,
  outside: RenderOutside,
  inspect?: boolean,
) => {
  const {ranges, sizes, offsets, renders, key} = inline;
  const {box, origin, z, clip, mask, transform, ref} = outside;

  const [left, top] = box;

  const n = ranges.length;

  let last: InlineRenderer | null = null;
  let lines: InlineLine[] = [];
  const hash = miniHash(key || -1, miniHash(left, top));

  const out: LiveElement[] = [];
  const els: LiveElement[] = [];
  const flush = (render: InlineRenderer) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const el = render(lines, origin, z, clip!, mask!, transform!, hash);
    if (Array.isArray(el)) els.push(...(el as any[]));
    else els.push(el);
    lines = [];
  };

  const render = ref?.(box, origin);
  if (render) out.push(render);

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

  if (els.length) out.push(quote(els));

  if (inspect) {
    const yeets = [] as UIAggregate[];

    const attributes = {
      rectangle: box,
      uv: [0, 0, 1, 1],
      repeat: 0,
      ...INSPECT_STYLE.parent,
    };

    yeets.push({
      count: 1,
      archetype: schemaToArchetype(UI_SCHEMA, attributes),

      attributes,
      transform,
      bounds: box,
    });

    const [left, top] = box;
    const n = ranges.length;
    for (let i = 0; i < n; ++i) {
      const size = sizes[i];
      const offset = offsets[i];

      const [x, y] = offset;
      const l = left + x;
      const t = top + y;
      const r = l + size[0];
      const b = t + size[1];

      const layout = [l, t, r, b] as Rectangle;

      const attributes = {
        rectangle: layout,
        uv: [0, 0, 1, 1],
        repeat: 0,
        ...INSPECT_STYLE.child
      };

      yeets.push({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),

        attributes,
        transform,
        bounds: layout,
      });
    }

    out.push(quote(yeet(yeets)));
  }

  return out.length ? out.length === 1 ? out[0] : out : null;
};

const rot = (a: number, b: number) => ((a << b) | (a >>> (32 - b))) >>> 0;
export const miniHash = (state: number, x: number) => {
  const i = Math.round(x);
  const f = Math.round((i - x) * 0x7FFFFFFF);
  state = rot(Math.imul(state, 0xc2b2ae35) ^ i, 5);
  state = rot(Math.imul(state, 0x85ebca6b) ^ f, 11);
  return state;
}
