import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { LayoutElement, Point, Dimension, Margin } from '../types';

import { memo, gather, yeet, useOne } from '@use-gpu/live';
import { getBlockMinMax, getBlockMargin, fitBlock } from '../lib/block';
import { normalizeMargin, makeBoxLayout, parseDimension, memoFit } from '../lib/util';

export type BlockProps = {
  direction?: 'x' | 'y',

  width?: Dimension,
  height?: Dimension,

  grow?: number,
  shrink?: number,
  margin?: number | Margin,
  padding?: number | Margin,
  snap?: boolean,

  element?: LiveElement<any>,
  children?: LiveElement<any>,
};

export const Block: LiveComponent<BlockProps> = memo((props: BlockProps) => {
  const {
    direction = 'y',
    width,
    height,
    grow = 0,
    shrink = 0,
    snap = true,
    margin: m = 0,
    padding: p = 0,
    children,
  } = props;

  const blockMargin = normalizeMargin(m);
  const padding = normalizeMargin(p);

  const Resume = (els: LayoutElement[]) => {
    const w = width != null && width === +width ? width : null;
    const h = height != null && height === +height ? height : null;

    const size = [w ?? 0, h ?? 0];
    const fixed = [w, h];

    const sizing = getBlockMinMax(els, fixed, direction);
    const margin = getBlockMargin(els, blockMargin, padding, direction);

    return yeet({
      sizing,
      margin,
      grow,
      shrink,
      fit: memoFit((into: Point) => {
        const w = width != null ? parseDimension(width, into[0], snap) : null;
        const h = height != null ? parseDimension(height, into[1], snap) : null;
        const fixed = [
          width != null ? w : null,
          height != null ? h : null,
        ] as [number | number, number | null];

        const {size, sizes, offsets, renders} = fitBlock(els, into, fixed, padding, direction);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      })
    });
  };
  
  return children ? gather(children, Resume) : null;
}, 'Block');
