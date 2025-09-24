import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { LayoutElement, Point, Alignment, Base, Margin } from '../types';

import { memo, gather, resume, yeet, useOne } from '@use-gpu/live';
import { getInlineMinMax, fitInline } from '../lib/inline';
import { normalizeMargin, makeBoxLayout, parseDimension } from '../lib/util';

export type InlineProps = {
  direction?: 'x' | 'y',
  align?: Alignment,
  anchor?: Base,

  grow?: number,
  shrink?: number,
  margin?: number | Margin,
  padding?: number | Margin,
  wrap?: boolean,
  snap?: boolean,

  element?: LiveElement<any>,
  children?: LiveElement<any>,
};

export const Inline: LiveComponent<InlineProps> = memo((props: BlockProps) => {
  const {
    direction = 'x',
    align = 'start',
    anchor = 'base',
    grow = 0,
    shrink = 0,
    wrap = true,
    snap = true,
    margin: m = 0,
    padding: p = 0,
    children,
  } = props;

  const margin = normalizeMargin(m);
  const padding = normalizeMargin(p);

  const Resume = useOne(() =>
    makeResume(direction, grow, shrink, snap, margin, padding),
    [direction, grow, shrink, snap, margin, padding]
  );

  return children ? gather(children, Resume) : null;
}, 'Inline');

const makeResume = (
  direction: 'x' | 'y',
  grow: number,
  shrink: number,
  snap: boolean,
  margin: Margin,
  padding: Margin,
) =>
  resume((els: LayoutElement[]) => {
    const sizing = getInlineMinMax(els, direction, wrap, snap);

    return yeet({
      sizing,
      margin,
      grow,
      shrink,
      fit: (into: Point) => {
        const {size, sizes, offsets, renders} = fitInline(els, into, direction, align, anchor, wrap, snap);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      }
    });
  });
