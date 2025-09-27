import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { Point, LayoutElement } from '../types';

import { memo, gather, yeet, useOne } from '@use-gpu/live';
import { fitAbsoluteBox } from '../lib/absolute';
import { makeBoxLayout, memoFit } from '../lib/util';

const NO_POINT4 = [0, 0, 0, 0];

export type AbsoluteProps = {
  left?: string | number | null,
  top?: string | number | null,
  right?: string | number | null,
  bottom?: string | number | null,
  width?: string | number | null,
  height?: string | number | null,

  snap?: boolean,
  children?: LiveElement<any>,
};

export const Absolute: LiveComponent<AbsoluteProps> = memo((props: AbsoluteProps) => {
  const {
    left: l,
    top: t,
    right: r,
    bottom: b,
    width: w,
    height: h,
    snap = true,
    children,
  } = props;

  const Resume = (els: LayoutElement[]) => {
    return yeet({
      sizing: NO_POINT4,
      margin: NO_POINT4,
      absolute: true,
      fit: memoFit((into: Point) => {
        const {size, sizes, offsets, renders} = fitAbsoluteBox(els, into, l, t, r, b, w, h, snap);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      }),
    });
  };

  return children ? gather(children, Resume) : null;
}, 'Absolute');
