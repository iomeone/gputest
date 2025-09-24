import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { Margin } from './types';

import { memo, gather, resume, yeet, useFiber, useOne } from '@use-gpu/live';
import { getStackMinMax, getStackMargin, fitStack } from '../lib/stack';
import { normalizeMargin, makeBoxLayout } from '../lib/util';

export type StackProps = {
  direction?: 'x' | 'y',

  width?: Dimension,
  height?: Dimension,

  grow?: number,
  shrink?: number,
  margin?: number | [number, number, number, number],
  padding?: number | [number, number, number, number],

  element?: LiveElement<any>,
  children?: LiveElement<any>,
};

export const Stack: LiveComponent<StackProps> = memo((props) => {
  const {
    direction = 'y',
    width,
    height,
    grow = 0,
    shrink = 0,
    margin: m = 0,
    padding: p = 0,
    children,
  } = props;

  const margin = normalizeMargin(m);
  const padding = normalizeMargin(p);

  const Resume = useOne(() =>
    makeResume(direction, width, height, grow, shrink, margin, padding),
    [direction, width, height, grow, shrink, margin, padding]
  );

  return gather(children, Resume);
}, 'Stack');

const makeResume = (
  direction: 'x' | 'y',
  width: Dimension | undefined,
  height: Dimension | undefined,
  grow: number,
  shrink: number,
  stackMargin: Margin,
  padding: Margin,
) =>
  resume((els: LayoutElement[]) => {
    const w = width != null ? parseDimension(width, 0, snap) : 0;
    const h = height != null ? parseDimension(height, 0, snap) : 0;
    const size = [w, h];

    const sizing = getStackMinMax(els, direction);
    const margin = getStackMargin(els, stackMargin, padding, direction);
    
    const key = useFiber().id;

    return yeet({
      sizing,
      margin,
      grow,
      shrink,
      fit: (into: Point) => {
        const {size, sizes, offsets, renders} = fitStack(els, into, padding, direction);
        return {
          size,
          render: makeBoxLayout(sizes, offsets, renders),
        };
      }
    });
  });
