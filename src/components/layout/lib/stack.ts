import { LiveElement } from '@use-gpu/live/types';
import { Point, Point4, LayoutElement, LayoutRenderer, Margin, Rectangle } from '../types';
import { mergeMargin } from './util';

const isAbsolute = (el: LayoutElement) => !!el.absolute;
const isNotAbsolute = (el: LayoutElement) => !el.absolute;

export const getStackMinMax = (
  els: LayoutElement[],
  direction: 'x' | 'y',
) => {
  const isX = direction === 'x';
  
  let allMinX = 0;
  let allMinY = 0;
  let allMaxX = 0;
  let allMaxY = 0;

  let i = 0;
  let m = 0;

  const n = els.length;
  if (isX) for (const {sizing, margin, absolute} of els) {
    if (!absolute) {
      const [minX, minY, maxX, maxY] = sizing;
      const [ml, mt, mr, mb] = margin;
    
      allMinX = allMinX + minX;
      allMinY = Math.max(allMinY, minY + mt + mb);

      allMaxX = allMaxX + maxX;
      allMaxY = Math.max(allMaxY, maxY + mt + mb);

      if (i !== 0) {
        m = mergeMargin(m, ml);
        allMinX = allMinX + m;
        allMaxX = allMaxX + m;
      }
      m = mr;
      ++i;
    }
  }
  else for (const {sizing, margin, absolute} of els) {
    if (!absolute) {
      const [minX, minY, maxX, maxY] = sizing;
      const [ml, mt, mr, mb] = margin;

      allMinY = allMinY + minY;
      allMinX = Math.max(allMinX, minX + ml + mr);

      allMaxY = allMaxY + maxY;
      allMaxX = Math.max(allMaxX, maxX + ml + mr);

      if (i !== 0) {
        m = mergeMargin(m, mt);
        allMinX = allMinX + m;
        allMaxX = allMaxX + m;
      }
      m = mb;
      ++i;
    }
  }

  return [allMinX, allMinY, allMaxX, allMaxY];
}

export const getStackMargin = (
  els: LayoutElement[],
  margin: Margin,
  padding: Margin,
  direction: 'x' | 'y',
) => {
  const isX = direction === 'x';
  const [pl, pt, pr, pb] = padding;

  const first = els.find(isNotAbsolute);
  const last  = (els as any).findLast(isNotAbsolute);

  const out = margin.slice() as Margin;
  if (first) {
    const [ml, mt] = first.margin;
    if (isX) margin[0] = mergeMargin(margin[0], Math.max(0, ml - pl));
    else margin[1] = mergeMargin(margin[1], Math.max(0, mt - pt));
  }
  if (last) {
    const [,, mr, mb] = last.margin;
    if (isX) margin[2] = mergeMargin(margin[2], Math.max(0, mr - pr));
    else margin[3] = mergeMargin(margin[3], Math.max(0, mb - pb));
  }

  return margin;
}

export const fitStack = (
  els: LayoutElement[],
  into: Point,
  padding: Point4,
  direction: 'x' | 'y',
) => {
  const isX = direction === 'x';

  const [pl, pt, pr, pb] = padding;
  let w =  isX ? pl : into[0];
  let h = !isX ? pt : into[1];

  let i = 0;
  let m = 0;

  const sizes = [] as Point[];
  const offsets = [] as Point[];
  const renders = [] as LayoutRenderer[];

  for (const el of els) {
    const {margin, fit} = el;
    const [ml, mt, mr, mb] = margin;

    const size = into.slice();
    size[0] -= pl + pr;
    size[1] -= pt + pb;

    if (isX) size[1] -= mt + mb;
    else size[0] -= ml + mr;

    const {render, size: fitted} = fit(size);

    sizes.push(fitted);
    renders.push(render);

    if (isAbsolute(el)) {
      if (isX) {
        offsets.push([w, pt + mt]);
      }
      else {
        offsets.push([pl + ml, h]);
      }
    }
    else {
      if (isX) {
        if (i !== 0) w += Math.max(m, ml);
        m = mr;

        offsets.push([w, pt + mt]);
        w += fitted[0];
      }
      else {
        if (i !== 0) h += Math.max(m, mt);
        m = mb;

        offsets.push([pl + ml, h]);
        h += fitted[1];
      }
      ++i;
    }
  }

  if (isX) w += padding[2];
  else h += padding[3];

  return {
    size: [w, h],
    sizes,
    offsets,
    renders,
  };
}
