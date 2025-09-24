import { LiveElement } from '@use-gpu/live/types';
import { LayoutElement, LayoutRenderer, Direction, Point, Margin, Rectangle, Alignment, Base } from '../types';

import { parseAnchor } from './util';

const isAbsolute = (el: LayoutElement) => !!el.absolute;
const isNotAbsolute = (el: LayoutElement) => !el.absolute;

export const getInlineMinMax = (
  els: LayoutElement[],
  direction: Direction,
  wrap: boolean,
  snap: boolean,
) => {
  const isX = direction === 'x' || direction === 'lr' || direction === 'rl';
  const [gapX, gapY] = gap;

  let allMinX = 0;
  let allMinY = 0;
  let allMaxX = 0;
  let allMaxY = 0;

  /*
  let i = 0;

  const n = els.length;
  if (isX) for (const {sizing, margin, absolute} of els) {
    if (!absolute) {
      const [minX, minY, maxX, maxY] = sizing;
      const [ml, mt, mr, mb] = margin;

      const mx = ml + mr;
      const my = mt + mb;

      if (wrap) {
        allMinX = Math.max(allMinX, minX + mx);
        allMaxY = allMaxY + maxY + my + gapY;
      }
      else {
        allMinX = allMinX + minX + mx + gapX;
        allMaxY = Math.max(allMaxY, maxY + my);
      }

      allMinY = Math.max(allMinY, minY + my);
      allMaxX = allMaxX + maxX + mx + gapX;
      ++i;
    }
  }
  else for (const {sizing, margin, absolute} of els) {
    if (!absolute) {
      const [minX, minY, maxX, maxY] = sizing;
      const [ml, mt, mr, mb] = margin;

      const mx = ml + mr;
      const my = mt + mb;

      if (wrap) {
        allMinY = Math.max(allMinY, minY + my);
        allMaxX = allMaxX + maxX + mx + gapX;
      }
      else {
        allMinY = allMinY + minY + my + gapY;
        allMaxX = Math.max(allMaxX, maxX + mx);
      }

      allMinX = Math.max(allMinX, minX + mx);
      allMaxY = allMaxY + maxY + my + gapY;

      ++i;
    }
  }

  if (snap) {
    allMinX = Math.round(allMinX);
    allMinY = Math.round(allMinY);
    allMaxX = Math.round(allMaxX);
    allMaxY = Math.round(allMaxY);
  }
  */

  return [allMinX, allMinY, allMaxX, allMaxY];
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
  return {
    size: [0, 0],
    sizes: [],
    offsets: [],
    renders: [],
  };

  /*
  const isX = direction === 'x' || direction === 'lr' || direction === 'rl';

  const [gapX, gapY] = gap;
  const gapMain = isX ? gapX : gapY;
  const gapCross = isX ? gapY : gapX;

  const alignMain = isX ? alignX : alignY;
  const alignCross = isX ? alignY : alignX;
  const anchorRatio = parseAnchor(anchor);

  const isSnap = !!snap;
  const isWrap = !!wrap;

  const spaceMain  = isX ? into[0] : into[1];
  const spaceCross = isX ? into[1] : into[0];

  let i = 0;

  const sizes   = [] as Point[];
  const offsets = [] as Point[];
  const renders = [] as LayoutRenderer[];

  const main = [] as LayoutElement[];
  const mainSizes = [] as number[];

  const cross = [] as {
    size: number,
    sizes: Point[],
    offsets: Point[],
    renders: LayoutRenderer[],
  }[];

  let accumMain = 0;
  let accumCross = 0;

  let maxMain = 0;
  let maxCross = 0;

  // Lay out a full row of boxes
  const reduceMain = () => {
    const n = mainSizes.length;
    if (!n) return;

    // Extra space to be grown (+) or shrunk (-)
    let slack = spaceMain - accumMain - gapMain;

    // Grow/shrink row if applicable
    let exact = slack === 0;
    if (slack > 0) {
      if (growRow(slack, main, mainSizes)) slack = 0;
    }
    else if (slack < 0) {
      if (shrinkRow(slack, main, mainSizes)) slack = 0;
    }

    // Spacing on main axis
    let axisGap = 0;
    let axisPos = 0;
    if (slack) [axisGap, axisPos] = getFlexSpacing(slack, n, alignMain);
    axisGap += gapMain;

    // Lay out a row of flexed boxes into their final size
    const crossSizes   = [] as Point[];
    const crossOffsets = [] as Point[];
    const crossRenders = [] as LayoutRenderer[];

    let maxSize = 0;
    for (let i = 0; i < n; ++i) {
      const {margin, sizing, fit} = main[i];
      const into = (isX ? [mainSizes[i], 0] : [0, mainSizes[i]]) as Point;

      const {render, size: fitted} = fit(into);
      const [ml, mt, mr, mb] = margin;

      let [w, h] = fitted;
      if (isX) w = mainSizes[i];
      else h = mainSizes[i];

      let s = isX ? w : h;
      let c = isX ? h : w;
      let m = isX ? ml + mr : mt + mb;

      crossRenders.push(render);
      crossOffsets.push(isX ? [ml + axisPos, mt] : [ml, mt + axisPos]);
      axisPos += s + m + axisGap;

      if (snap) {
        s = Math.round(s);
        c = Math.round(c);
      }

      crossSizes.push(isX ? [s, h] : [w, s]);
      maxSize = Math.max(maxSize, c);
    }

    cross.push({
      size: maxSize,
      sizes: crossSizes,
      offsets: crossOffsets,
      renders: crossRenders,
    });
    accumCross += maxSize;
    maxCross = Math.max(accumCross, maxCross);
    accumCross += gapCross;

    accumMain = main.length = mainSizes.length = 0;
  }

  const reduceCross = () => {
    const n = cross.length;
    if (!n) return;

    const slack = Math.max(0, spaceCross - accumCross - gapCross);

    let crossGap = 0;
    let crossPos = 0;
    if (slack > 0) [crossGap, crossPos] = getFlexSpacing(slack, n, alignCross);
    crossGap += gapCross;

    for (let i = 0; i < n; ++i) {
      const {size, sizes: ss, offsets: os, renders: rs} = cross[i];

      const m = ss.length;
      for (let j = 0; j < m; ++j) {
        const lead = anchorRatio * (size - ss[j][isX ? 1 : 0]);
        let [l, t] = os[j];

        const o = crossPos + lead;
        if (isX) t += o;
        else l += o;

        if (snap) {
          l = Math.round(l);
          t = Math.round(t);
        }

        sizes.push(ss[j]);
        offsets.push([l, t]);
        renders.push(rs[j]);
      }

      crossPos += size + crossGap;
    }

    cross.length = 0;
  };

  const n = els.length;
  for (const el of els) {
    const {margin, sizing, fit, grow, shrink} = el;
    const [ml, mt, mr, mb] = margin;

    if (isAbsolute(el)) {
      const {render, size: fitted} = fit(sizing.slice(0, 2) as Point);

      sizes.push(fitted);
      renders.push(render);
      offsets.push([ml, mt]);
    }
    else {
      const size = sizing[isX ? 0 : 1];
      const mOn  = isX ? ml + mr : mt + mb;
      
      if (wrap && (accumMain + size + mOn > spaceMain)) reduceMain();
      accumMain += size + mOn;
      maxMain = Math.max(maxMain, accumMain);
      accumMain += gapMain;

      main.push(el);
      mainSizes.push(size);
    }
  }
  reduceMain();
  reduceCross();

  let [w, h] = into;
  w = Math.max(w,  isX ? maxMain : maxCross);
  h = Math.max(h, !isX ? maxMain : maxCross);
  
  return {
    size: [w, h],
    sizes,
    offsets,
    renders,
  };
  */
}

export const getFlexSpacing = (
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

// Grow all applicable blocks in a row to add extra slack.
export const growRow = (slack: number, row: LayoutElement[], sizes: number[]) => {
  const n = row.length;

  let weight = 0;
  for (let i = 0; i < n; ++i) if (row[i].grow! > 0) weight += row[i].grow!;

  if (weight > 0) {
    for (let i = 0; i < n; ++i) if (row[i].grow! > 0) {
      sizes[i] += slack * row[i].grow! / weight;
    }
    return true;
  }
  return false;
}

// Shrink all applicable blocks in a row to remove excess slack.
export const shrinkRow = (slack: number, row: LayoutElement[], sizes: number[]): boolean => {
  const n = row.length;

  let weight = 0;
  for (let i = 0; i < n; ++i) if (row[i].shrink!) weight += row[i].shrink! * sizes[i];

  if (weight > 0) {
    let negative = 0;
    for (let i = 0; i < n; ++i) if (row[i].shrink! > 0 && sizes[i]) {
      sizes[i] += slack * row[i].shrink! * sizes[i] / weight;
      if (sizes[i] < 0) {
        negative += sizes[i];
        sizes[i] = 0;
      }
    }
    if (negative) {
      shrinkRow(negative, row, sizes);
    }
    return true;
  }
  return false;
}
