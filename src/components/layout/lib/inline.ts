import { LiveElement } from '@use-gpu/live/types';
import { FontMetrics } from '@use-gpu/text/types';
import { LayoutElement, InlineElement, LayoutRenderer, Direction, Point, Margin, Rectangle, Alignment, Base } from '../types';

import { parseBase, parseAnchor } from './util';

export const getInlineMinMax = (
  els: (LayoutElement | InlineElement)[],
  direction: Direction,
  wrap: boolean,
  snap: boolean,
) => {
  const isX = direction === 'x' || direction === 'lr' || direction === 'rl';

  let allMinMain = 0;
  let allMinCross = 0;
  let allMaxMain = 0;
  let allMaxCross = 0;

  let i = 0;
  let caretMain = 0;
  let caretCross = 0;

  const n = els.length;
  for (const {spans, height, absolute} of els) {
    if (!absolute) {
      const {ascent, descent, lineHeight} = height;

      for (const {hard, width} of spans) {
        const {advance, trim} = width;

        allMinMain = Math.max(allMinMain, advance - trim);
        allMaxCross += lineHeight;

        caretMain+= advance;
        if (hard) {
          caretMain -= trim;
          caretCross += lineHeight;

          allMaxMain = Math.max(allMaxMain, caretMain);
          caretMain = 0;
        }
      }
      ++i;
    }
    if (!wrap) allMinMain = allMaxMain;
    allMinCross = caretCross;
  }

  if (snap) {
    allMinMain = Math.round(allMinMain);
    allMinCross = Math.round(allMinCross);
    allMaxMain = Math.round(allMaxMain);
    allMaxCross = Math.round(allMaxCross);
  }

  return isX
    ? [allMinMain, allMinCross, allMaxMain, allMaxCross]
    : [allMinCross, allMinMain, allMaxCross, allMaxMain];
}

export const fitInline = (
  els: LayoutElement[],
  into: Point,
  direction: Direction,
  align: Alignment,
  anchor: Base,
  wrap: boolean,
  snap: boolean,
) => {
  const isX = direction === 'x' || direction === 'lr' || direction === 'rl';

  const anchorRatio = parseBase(anchor);

  const isSnap = !!snap;
  const isWrap = !!wrap;

  const spaceMain  = isX ? into[0] : into[1];
  const spaceCross = isX ? into[1] : into[0];

  let caretMain = 0;
  let caretCross = 0;
  let trimCross = 0;

  const n = els.length;

  let mainBase = 0;
  let mainSize = 0;
  let wordCount = 0;
  let crossSize = 0;

  const ranges  = [] as Point[];
  const offsets = [] as [number, number, number][];
  const renders = [] as LayoutRenderer[];

  const mainSpans = [] as [number, number];
  const mainEls = [] as InlineElement[];

  const reduceMain = () => {
    const n = mainEls.length;
    if (!n) return;

    const [, endIndex] = mainSpans[n - 1];
    const {spans: lastSpans} = mainEls[n - 1];
    const lastSpan = lastSpans[endIndex - 1];
    const {width: {trim}} = lastSpan;

    const slack = spaceMain - (caretMain - trim);

    let mainGap = 0;
    let mainPos = 0;
    if (slack) [mainGap, mainPos] = getInlineSpacing(slack, wordCount, align);

    for (let i = 0; i < n; ++i) {
      const span = mainSpans[i];
      const {startIndex, endIndex} = span;

      const {spans, height, render} = mainEls[i];
      const {ascent, descent, lineHeight} = height;

      const crossPos = caretCross + mainBase - ascent;
      const offset = isX ? [mainPos, crossPos, mainGap] : [crossPos, mainPos, mainGap];

      for (let j = startIndex; j < endIndex; ++j) {
        const {width: {advance, trim}} = spans[j];
        mainPos += advance;
        if (trim > 0) mainPos += mainGap;
      }

      ranges.push(span);
      offsets.push(offset);
      renders.push(render);
    }

    caretMain = 0;
    caretCross += crossSize;

    mainBase = 0;
    mainSize = 0;
    crossSize = 0;
    wordCount = 0;
  
    mainSpans.length = 0;
    mainEls.length = 0;
  };

  const addSpan = (el: InlineElement, startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;

    const {height: {ascent, descent, lineHeight}} = el;

    mainBase = Math.max(mainBase, ascent);
    mainSize = Math.max(mainSize, ascent - descent);
    crossSize = Math.max(crossSize, lineHeight);

    mainSpans.push([startIndex, endIndex]);
    mainEls.push(el);
  };

  for (const el of els) {
    let startIndex = 0;
    let endIndex = 0;

    let i = 0;
    const {spans, absolute} = el;
    for (const span of spans) {
      const {hard, width} = span;
      const {advance, trim} = width;
      
      if (wrap && (caretMain + advance - trim > spaceMain)) {
        addSpan(el, startIndex, endIndex);
        reduceMain();

        startIndex = i;
        caretMain = 0;
      }

      endIndex = ++i;
      caretMain += advance;
      if (trim) wordCount++;

      if (hard) {
        addSpan(el, startIndex, endIndex);
        reduceMain();

        startIndex = endIndex;
        caretMain = 0;
      }
    }

    addSpan(el, startIndex, endIndex);
  }
  reduceMain();
  
  const size = isX ? [into[0], caretCross] : [caretCross, into[1]];
  
  return {
    size,
    ranges,
    offsets,
    renders,
  };
}

export const getInlineSpacing = (
  slack: number,
  n: number,
  align: Alignment,
) => {
  let gap = 0;
  let lead = 0;

  const isJustify = align === 'justify';
  const isBetween = align === 'between';
  const isEvenly  = align === 'evenly';

  if (slack > 0 && (isEvenly || isBetween || isJustify)) {
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
    lead = parseAnchor(align) * slack;
  }

  return [gap, lead];
};
