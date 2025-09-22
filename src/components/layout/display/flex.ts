import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { Margin, Direction, Alignment, Anchor } from './types';

import { resume, yeet, memo, gather, useOne, useMemo } from '@use-gpu/live';
import { getFlexMinMax, fitFlex } from '../lib/flex';
import { makeBoxLayout, normalizeAlignment, normalizeAnchor, normalizeGap } from '../lib/util';

const NO_MARGIN = [0, 0, 0, 0] as Margin;

export type FlexProps = {
  direction?: Direction,

  gap?: number | Point,
  align?: Alignment | [Alignment, Alignment],
  anchor?: Anchor,

  grow?: number,
  shrink?: number,
  wrap?: boolean,
  snap?: boolean,

  element?: LiveElement<any>,
  children?: LiveElement<any>,
};

export const Flex: LiveComponent<BlockProps> = memo((props) => {
  const {
    direction = 'x',
    gap: g = 0,
    align: al = 'start',
    anchor = 'start',
    grow = 0,
    shrink = 1,
    wrap = false,
    snap = true,
    render,
    children,
  } = props;

  const gap    = normalizeGap(g);
  const align  = normalizeAlignment(al);

  const Resume = useOne(() =>
    makeResume(direction, gap, align, anchor, grow, shrink, wrap, snap),
    [direction, gap, align, anchor, grow, shrink, wrap, snap]
  );

  return gather(children, Resume);
}, 'Flex');

const makeResume = (
  direction: Direction,
  gap: number | Point,
  align: [Alignment, Alignment],
  anchor: Anchor,
  grow: number,
  shrink: number,
  wrap: boolean,
  snap: boolean,
) =>
  resume((els: LayoutElement[]) => {
    const sizing = getFlexMinMax(els, direction, gap, wrap, snap);

    return yeet({
      sizing,
      margin: NO_MARGIN,
      grow,
      shrink,
      fit: (into: Point) => {
        const {size, sizes, offsets, renders} = fitFlex(els, into, direction, gap, align[0], align[1], anchor, wrap, snap);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      }
    });
  }, 'Flex');
