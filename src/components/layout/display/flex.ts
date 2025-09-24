import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { LayoutElement, Margin, Dimension, Direction, Alignment, Anchor, Point } from '../types';

import { resume, yeet, memo, gather, useOne, useMemo } from '@use-gpu/live';
import { getFlexMinMax, fitFlex } from '../lib/flex';
import { makeBoxLayout, normalizeAlignment, normalizeGap, parseDimension } from '../lib/util';

const NO_MARGIN = [0, 0, 0, 0] as Margin;

export type FlexProps = {
  direction?: Direction,

  width?: Dimension,
  height?: Dimension,

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

export const Flex: LiveComponent<FlexProps> = memo((props: FlexProps) => {
  const {
    direction = 'x',
    width,
    height,
    gap: g = 0,
    align: al = 'start',
    anchor = 'start',
    grow = 0,
    shrink = 1,
    wrap = false,
    snap = true,
    children,
  } = props;

  const gap    = normalizeGap(g);
  const align  = normalizeAlignment(al);

  const Resume = useOne(() =>
    makeResume(direction, width, height, gap, align, anchor, grow, shrink, wrap, snap),
    [direction, width, height, gap, align, anchor, grow, shrink, wrap, snap]
  );

  return children ? gather(children, Resume) : null;
}, 'Flex');

const makeResume = (
  direction: Direction,
  width: Dimension | undefined,
  height: Dimension | undefined,
  gap: Point,
  align: [Alignment, Alignment],
  anchor: Anchor,
  grow: number,
  shrink: number,
  wrap: boolean,
  snap: boolean,
) =>
  resume((els: LayoutElement[]) => {
    const w = width != null && width === +width ? width : null;
    const h = height != null && height === +height ? height : null;

    const size = [w ?? 0, h ?? 0];
    const fixed = [w, h];

    const sizing = getFlexMinMax(els, fixed, direction, gap, wrap, snap);

    return yeet({
      sizing,
      margin: NO_MARGIN,
      grow,
      shrink,
      fit: (into: Point) => {
        const w = width != null ? parseDimension(width, into[0], snap) : null;
        const h = height != null ? parseDimension(height, into[1], snap) : null;
        const fixed = [
          width != null ? w : null,
          height != null ? h : null,
        ] as [number | number, number | null];

        const {size, sizes, offsets, renders} = fitFlex(els, into, fixed, direction, gap, align[0], align[1], anchor, wrap, snap);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      }
    });
  });
