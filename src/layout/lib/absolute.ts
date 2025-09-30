import type { Rectangle } from '@use-gpu/core';
import type { LayoutElement, FitInto, AutoXY, AutoRectangle, Direction } from '../types';

import { evaluateDimension } from '../parse';
import { fitBlock } from './block';
import { isHorizontal } from './util';

const NO_LAYOUT = [0, 0, 0, 0] as Rectangle;

export const fitAbsoluteBox = (
  els: LayoutElement[],
  into: FitInto,
  l?: string | number | null,
  t?: string | number | null,
  r?: string | number | null,
  b?: string | number | null,
  w?: string | number | null,
  h?: string | number | null,
  a?: number | null,
  direction: Direction = 'y',
  snap?: boolean,
) => {
  const [iw, ih, fw, fh] = into;
  const box = resolveAbsoluteBox([0, 0, iw ?? fw, ih ?? fh], l, t, r, b, w, h, a, snap);
  // eslint-disable-next-line prefer-const
  let [left, top, right, bottom] = box;

  const fixed = [
    left != null && right != null ? right - left : null,
    top != null && bottom != null ? bottom - top : null,
  ] as AutoXY;

  const isX = isHorizontal(direction);
  const shrinkWrap = isX ? fixed[0] === null : fixed[1] === null;

  const {size, sizes, offsets, renders, pickers} = fitBlock(els, into, fixed, NO_LAYOUT, direction, true, shrinkWrap);

  if (left == null) left = right != null && size[0] != null ? right - size[0] : 0;
  if (top == null) top = bottom != null && size[1] != null ? bottom - size[1] : 0;

  for (const o of offsets) {
    o[0] += left;
    o[1] += top;
  }

  return {size, sizes, offsets, renders, pickers};
};

export const resolveAbsoluteBox = (
  box: Rectangle,
  l?: string | number | null,
  t?: string | number | null,
  r?: string | number | null,
  b?: string | number | null,
  w?: string | number | null,
  h?: string | number | null,
  a?: number | null,
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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (l != null) left   += evaluateDimension(l, width)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (r != null) right  -= evaluateDimension(r, width)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (t != null) top    += evaluateDimension(t, height)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (b != null) bottom -= evaluateDimension(b, height)!;

  if (w != null) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    width = evaluateDimension(w, width)!;
    if (l != null || r == null) right = left + width;
    else left = right - width;
    favorW = true;
  }

  if (h != null) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    height = evaluateDimension(h, height)!;
    if (t != null || b == null) bottom = top + height;
    else top = bottom - height;
    favorH = true;
  }

  if (a != null) {
    if (w != null && h == null) height = width / a;
    else if (h != null && w == null) width = height * a;
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

  const rect = [left, top, right, bottom] as AutoRectangle;
  if (r != null && l == null && w == null) rect[0] = null;
  if (l != null && r == null && w == null) rect[2] = null;
  if (b != null && t == null && h == null) rect[1] = null;
  if (t != null && b == null && h == null) rect[2] = null;

  if (l == null && r == null && w == null) rect[2] = null;
  if (t == null && b == null && h == null) rect[3] = null;

  return rect;
}
