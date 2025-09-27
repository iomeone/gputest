import type { Point, Point4, Rectangle } from '@use-gpu/core';
import type { InlineElement, LayoutElement, InlineRenderer, LayoutRenderer, LayoutPicker, Direction, FitInto, Margin, Alignment, Anchor, Base } from '../types';

import { makeTuples } from '@use-gpu/core';
import { makeInlineCursor } from './cursor';
import { getAlignmentSpacing, isHorizontal, makeMiniHash } from './util';

const NO_RENDER = () => null;
const NO_MARGIN: Point4 = [0, 0, 0, 0];

export const resolveInlineBlockElements = (els: (InlineElement | LayoutElement)[], direction: Direction) => {

  const into = [null, null, 0, 0] as FitInto;

  const isX = isHorizontal(direction);

  const out: InlineElement[] = [];
  for (const el of els) {
    if ('spans' in el) out.push(el);
    else {
      const {fit, absolute, margin, inline = 'center'} = el;
      const [ml, mt, mr, mb] = margin;

      const block = fit(into);
      const {size} = block;

      const advance = isX ? size[0] : size[1];
      const cross = isX ? size[1] : size[0];

      out.push({
        spans: makeTuples([advance, 1e-10, 0], 3),
        height: {ascent: 0, descent: 0, lineHeight: cross, xHeight: 0, emUnit: 1},
        margin,
        inline,
        block,
        absolute,
        render: NO_RENDER,
      })
    }
  }

  return out;
};

export const getInlineMinMax = (
  els: InlineElement[],
  direction: Direction,
  wrap: boolean,
  snap: boolean,
) => {
  const isX = isHorizontal(direction);

  let allMinMain = 0;
  let allMaxMain = 0;

  let i = 0;
  let caretMain = 0;
  let caretCross = 0;

  let lineHeight = 0;
  const perSpan = (advance: number, trim: number, hard: number) => {
    allMinMain = Math.max(allMinMain, advance - trim);

    caretMain += advance;
    if (hard) {
      caretMain -= trim;
      caretCross += lineHeight;

      allMaxMain = Math.max(allMaxMain, caretMain);
      caretMain = 0;
    }
  };
  
  const n = els.length;
  for (const {spans, height, margin, absolute} of els) {
    const [ml, mt, mr, mb] = margin ?? NO_MARGIN;
    if (!absolute) {
      lineHeight = height.lineHeight + (isX ? mt + mb : ml + mr);

      caretMain += isX ? ml : mt;
      spans.iterate(perSpan);
      caretMain += isX ? mr : mb;

      ++i;
    }
  }

  // Cover text rounding
  allMaxMain = Math.max(allMaxMain, caretMain) + 1;
  if (!wrap) allMinMain = allMaxMain;

  caretCross += lineHeight;
  let allCross = caretCross;

  if (snap) {
    allMinMain = Math.round(allMinMain);
    allMaxMain = Math.round(allMaxMain);
    allCross = Math.round(allCross);
  }

  return isX
    ? [allMinMain, null, allMaxMain, allCross]
    : [null, allMinMain, allCross, allMaxMain];
}

export const fitInline = (
  els: InlineElement[],
  into: FitInto,
  direction: Direction,
  align: Alignment,
  anchor: Base,
  wrap: boolean,
  snap: boolean,
) => {
  const isX = direction === 'x' || direction === 'lr' || direction === 'rl';

  const isSnap = !!snap;

  const spaceMain = isX ? into[0] : into[1];

  let caretCross = 0;
  let maxMain = 0;

  const n = els.length;

  const ranges  = [] as Point[];
  const sizes   = [] as Point[];
  const offsets = [] as [number, number, number][];
  const anchors = [] as Point[];
  const renders = [] as InlineRenderer[];
  const pickers = [] as (LayoutPicker | null)[];

  // Text rendering is expensive
  const miniHash = makeMiniHash();

  // Push all text spans into layout
  const cursor = makeInlineCursor(wrap ? spaceMain || 0 : 0, align);

  for (const el of els) {
    const {spans, block, margin, absolute, height: {lineHeight, ascent, descent, xHeight}} = el;
    const [ml, mt, mr, mb] = margin ?? NO_MARGIN;

    const n = spans.length;
    if (n === 1) {
      spans.iterate((advance, trim, hard) => {
        cursor.push(advance + (isX ? ml + mr : mt + mb), trim, hard, lineHeight + (isX ? (mt + mb) : (ml + mr)), ascent, -descent, xHeight);
      }, 0, 1);
    }
    else {
      spans.iterate((advance, trim, hard) => {
        cursor.push(advance + (isX ? ml : mt), trim, hard, lineHeight + (isX ? (mt + mb) : (ml + mr)), ascent, -descent, xHeight);
      }, 0, 1);
      spans.iterate((advance, trim, hard) => {
        cursor.push(advance, trim, hard, lineHeight + (isX ? (mt + mb) : (ml + mr)), ascent, -descent, xHeight);
      }, 1, n - 1);
      spans.iterate((advance, trim, hard) => {
        cursor.push(advance + (isX ? mr : mb), trim, hard, lineHeight + (isX ? (mt + mb) : (ml + mr)), ascent, -descent, xHeight);
      }, n - 1, n);
    }
  }

  // Process produced spans
  let i = 0;
  let span = 0;
  const layouts = cursor.gather((start, end, gap, lead, count, lineHeight, ascent, descent, xHeight, index) => {
    let n = end - start;
    let mainPos = lead;

    miniHash(start);
    miniHash(end);
    miniHash(gap * 100);
    miniHash(lead * 100);

    const cross = Math.max(lineHeight, ascent + descent);
    const blockSlack = Math.max(0, cross - ascent - descent);

    let t = 0;

    while (n > 0 && i < els.length) {
      const el = els[i];
      const {spans, height, margin, inline, block, render, pick} = el;
      const {ascent: a, descent: d, lineHeight: lh} = height;
      const [ml, mt, mr, mb] = margin ?? NO_MARGIN;
      
      const last = spans.length - span;
      const count = Math.min(n, last);

      const indentStart = span  === 0    ? (isX ? ml : mt) : 0;
      const indentEnd   = count === last ? (isX ? mr : mb) : 0;
      mainPos += indentStart;
      
      const resolvedAnchor = inline ?? anchor;

      let crossPos = caretCross;
      if (resolvedAnchor === 'base') {
        crossPos += getAlignmentSpacing(blockSlack, 1, false, 'center')[1];
        crossPos += ascent - (block ? lh : a);
      }
      else if (resolvedAnchor === 'base-center') {
        crossPos += getAlignmentSpacing(blockSlack, 1, false, 'center')[1];
        crossPos += ascent - xHeight / 2 - (block ? lh / 2 : a / 2);
      }
      else {
        crossPos += getAlignmentSpacing(cross - lh, 1, false, resolvedAnchor as Anchor)[1];
      }

      const sm = isSnap ? Math.round(mainPos) : mainPos;
      const sc = isSnap ? Math.round(crossPos) : crossPos;
      const offset = (isX ? [sm, sc, gap] : [sc, sm, gap]) as [number, number, number];

      let accum = 0;
      const s = span;
      const e = span + count;
      spans.iterate((advance, trim) => {
        accum += advance;
        if (trim) accum += gap;
        t = trim;
      }, s, e);

      mainPos += accum;
      mainPos += indentEnd;

      const size = (isX ? [accum - gap, lh] : [lh, accum - gap]) as Point;

      ranges.push([s, e]);
      sizes.push(size);
      offsets.push(offset);
      renders.push(render);
      pickers.push(pick ?? null);

      span += count;
      n -= count;
      
      if (count === last) {
        if (block) anchors.push(offset as number[] as Point);
        i++;
        span = 0;
      }
    }

    maxMain = Math.max(maxMain, mainPos - gap - t, 0);
    caretCross += cross;
  });
  
  const size = isX ? [into[0] ?? maxMain, caretCross] : [caretCross, into[1] ?? maxMain];
  
  return {
    size,
    ranges,
    sizes,
    offsets,
    anchors,
    renders,
    pickers,
    key: miniHash(),
  };
}
