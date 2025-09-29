import type { Point } from '@use-gpu/core';
import type { Alignment } from '../types';

import { makeTuples } from '@use-gpu/core';
import { getAlignmentSpacing } from './util';

type InlineReduce = (
  start: number,
  end: number,
  gap: number,
  lead: number,
  count: number,
  cross: number,
  ascent: number,
  descent: number,
  xHeight: number,
  index: number,
) => void;

type InlineCursor = {
  push: (
    advance: number,
    trim: number,
    hard: number,
    cross: number,
    base: number,
    descent: number,
    xHeight: number,
  ) => void;
  flush: (x: number) => void,
  gather: (reduce: InlineReduce) => Float32Array,
};

// Layout cursor for putting inline items on lines, with line wrapping, alignment and justification.
export const makeInlineCursor = (
  max: number,
  align: Alignment,
  even?: boolean,
): InlineCursor => {

  let spanCount = 0;
  let spanAdvance = 0;
  let spanTrim = 0;
  let spanCross = 0;
  let spanAscent = 0;
  let spanDescent = 0;
  let spanXHeight = 0;

  let start: number = 0;
  let end: number = 0;
  
  let chunkAdvance = 0;
  let chunkIndex = 0;
  let chunkCross = 0;

  let rows: number[] = [];
  let sizes: number[] = [];
  let index = 0;

  const push = (
    advance: number,
    trim: number,
    hard: number,
    cross: number,
    ascent: number,
    descent: number,
    xHeight: number,
  ) => {
    if (max > 0 && (spanAdvance + advance - trim > max)) {
      if (!spanTrim) spanCount++;

      flush(0);
      start = index;
    }

    end = index + 1;

    if (hard) {
      spanCount++;
    }
    else if (trim) {
      spanCount++;
    }

    spanAdvance += advance;
    spanCross = Math.max(spanCross, cross);
    spanAscent = Math.max(spanAscent, ascent);
    spanDescent = Math.max(spanDescent, descent);
    spanXHeight = Math.max(spanXHeight, xHeight);
    spanTrim = trim;

    if (hard) {
      flush(hard);
      start = end;
    }

    index++;
  };

  const flush = (hard: number) => {
    const n = end > start;
    if (n) {
      const spanSize = spanAdvance - spanTrim;
      chunkAdvance = Math.max(chunkAdvance, spanSize);

      rows.push(start, end, hard, spanSize, spanCount, spanCross, spanAscent, spanDescent, spanXHeight, chunkIndex);
      chunkCross += spanCross;
    }

    spanCount = 0;
    spanAdvance = 0;
    spanTrim = 0;
    spanCross = 0;
    spanAscent = 0;
    spanDescent = 0;

    if (hard === 2) {
      chunkIndex++;
      sizes.push(chunkAdvance, chunkCross);

      chunkAdvance = 0;
      chunkCross = 0;
    }
  };
  
  const gather = (reduce: InlineReduce) => {
    spanCount++;
    flush(2);

    const s = makeTuples(sizes, 2);
    const r = makeTuples(rows, 10);
    r.iterate((
      start: number,
      end: number,
      hard: number,
      advance: number,
      count: number,
      cross: number,
      ascent: number,
      descent: number,
      xHeight: number,
      index: number,
    ) => {
      let slack;
      if (even) {
        slack = (Math.floor((max || s.get(index, 0)) / 2) - Math.floor(advance / 2)) * 2;
      } else {
        slack = (max || s.get(index, 0)) - advance;
      }
      const [gap, lead] = getAlignmentSpacing(slack, count, !!hard, align);
      reduce(start, end, gap, lead, count, cross, ascent, descent, xHeight, index);
    });

    return new Float32Array(sizes);
  };

  return { push, flush, gather };
}

type FlexReduce = (
  sizes: number[],
  start: number,
  end: number,
  gap: number,
  lead: number,
) => void;

type FlexCursor = {
  push: (
    main: number,
    margin: number,
    gap: number,
    grow: number,
    shrink: number,
  ) => void;
  flush: (x: number) => void,
  gather: (reduce: FlexReduce) => number,
};

// Layout cursor for putting boxes on flex lines, with optional wrapping, grow/shrink, alignment and justification.
export const makeFlexCursor = (
  into: number | null,
  align: Alignment,
  wrap?: boolean,
): FlexCursor => {

  let spanMain = 0;
  let spanTrim = 0;
  let chunkMain = 0;

  let start: number = 0;
  let end: number = 0;

  let rows: number[] = [];
  let sizes: number[] = [];
  let grows: number[] = [];
  let shrinks: number[] = [];
  let index = 0;

  const push = (
    main: number,
    margin: number,
    gap: number,
    grow: number,
    shrink: number,
  ) => {
    if (into != null && wrap && (spanMain + main + margin > into)) {
      flush();
      start = index;
    }

    end = index + 1;

    spanMain += main + margin + gap;
    spanTrim  = gap;

    sizes.push(main);
    grows.push(grow);
    shrinks.push(shrink);

    index++;
  };

  const flush = () => {
    const n = end > start;
    if (n) {
      const spanSize = spanMain - spanTrim;
      chunkMain = Math.max(chunkMain, spanSize);
      if (Number.isNaN(chunkMain)) debugger;

      rows.push(start, end, spanSize);
    }

    spanMain = 0;
    spanTrim = 0;
  };
  
  const gather = (reduce: FlexReduce): number => {
    flush();

    const r = makeTuples(rows, 3);
    const l = r.length - 1;

    r.iterate((
      start: number,
      end: number,
      main: number,
      index: number,
    ) => {
      let slack = (into ?? chunkMain) - main;
      
      if (slack > 0 && growRow(slack, grows, sizes, start, end)) slack = 0;
      if (slack < 0 && shrinkRow(slack, shrinks, sizes, start, end)) slack = 0;
      
      const [gap, lead] = getAlignmentSpacing(slack, end - start, index === l, align);

      reduce(sizes, start, end, gap, lead);
    });
    
    return into ?? chunkMain;
  };

  return { push, flush, gather };
}


// Grow all applicable blocks in a row to add extra slack.
export const growRow = (slack: number, grow: number[], sizes: number[], start: number, end: number) => {
  let weight = 0;
  for (let i = start; i < end; ++i) if (grow[i] > 0) weight += grow[i];

  if (weight > 0) {
    for (let i = start; i < end; ++i) if (grow[i] > 0) {
      sizes[i] += slack * grow[i] / weight;
    }
    return true;
  }
  return false;
}

// Shrink all applicable blocks in a row to remove excess slack.
export const shrinkRow = (slack: number, shrink: number[], sizes: number[], start: number, end: number): boolean => {
  let weight = 0;
  for (let i = start; i < end; ++i) if (shrink[i]) weight += shrink[i] * sizes[i];

  if (weight > 0) {
    let negative = 0;
    for (let i = start; i < end; ++i) if (shrink[i] > 0 && sizes[i]) {
      sizes[i] += slack * shrink[i] * sizes[i] / weight;
      if (sizes[i] < 0) {
        negative += sizes[i];
        sizes[i] = 0;
      }
    }
    if (negative) {
      shrinkRow(negative, shrink, sizes, start, end);
    }
    return true;
  }
  return false;
}

