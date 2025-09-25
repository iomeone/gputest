import { Point, LayoutElement, LayoutRenderer, Rectangle } from '../types';
import { parseDimension } from './util';

const NO_LAYOUT = [0, 0, 0, 0] as Rectangle;

export const fitAbsoluteBox = (
  els: LayoutElement[],
  into: Point,
  l?: string | number | null,
  t?: string | number | null,
  r?: string | number | null,
  b?: string | number | null,
  w?: string | number | null,
  h?: string | number | null,
  snap?: boolean,
) => {
  let [width, height] = into;
  const box = resolveAbsoluteBox([0, 0, width, height], l, t, r, b, w, h, snap);
  const [left, top, right, bottom] = box;

  width = right - left;
  height = bottom - top;
  const size = [width, height] as Point;

  const sizes = [] as Point[];
  const offsets = [] as Point[];
  const renders = [] as LayoutRenderer[];

  const n = els.length;
  for (const el of els) {
    const {margin, fit} = el;
    const {render, size: fitted} = fit(size);
    const [ml, mt] = margin;

    sizes.push(fitted);
    offsets.push([left + ml, top + mt]);
    renders.push(render);
  }

  return {size, sizes, offsets, renders};
};

export const resolveAbsoluteBox = (
  box: Rectangle,
  l?: string | number | null,
  t?: string | number | null,
  r?: string | number | null,
  b?: string | number | null,
  w?: string | number | null,
  h?: string | number | null,
  snap?: boolean,
) => {
  let [
    left,
    top,
    right,
    bottom,
  ] = box;
  
  let width = right - left;
  let height = bottom - top;

  let favorW = false;
  let favorH = false;

  if (l != null) left   += parseDimension(l, width);
  if (r != null) right  -= parseDimension(r, width);
  if (t != null) top    += parseDimension(t, height);
  if (b != null) bottom -= parseDimension(b, height);

  if (w != null) {
    width = parseDimension(w, width);
    if (l != null || r == null) right = left + width;
    else left = right - width;
    favorW = true;
  }

  if (h != null) {
    height = parseDimension(h, height);
    if (t != null || b == null) bottom = top + height;
    else top = bottom - height;
    favorH = true;
  }

  if (snap) {
    left = Math.round(left);
    top = Math.round(top);

    if (favorW) {
      width = Math.round(width);
      right = left + width;
    }
    else {
      right = Math.round(right);
      width = right - left;
    }

    if (favorH) {
      height = Math.round(height);
      bottom = top + height;
    }
    else {
      bottom = Math.round(bottom);
      height = bottom - top;
    }
  }

  return [left, top, right, bottom] as Rectangle;
}
