import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';
import { ImageAttachment, Dimension, Margin, Fit, Repeat, Rectangle, Anchor, Point, Point4 } from './types';

import { keyed, yeet, useFiber, useMemo } from '@use-gpu/live';
import { parseDimension, normalizeMargin } from '../lib/util';

import { Surface } from '../shape/surface';

export type ElementProps = {
  width?: Dimension,
  height?: Dimension,
  margin?: Margin | number,
  radius?: Margin | number,
  border?: Margin | number,
  stroke?: Point4,
  fill?: Point4,

  image?: ImageAttachment,

  grow?: number,
  shrink?: number,
  snap?: boolean,

  children?: LiveElement<any>,
};

export const Element: LiveComponent<ElementProps> = (props) => {
  const {
    width,
    height,
    // margin
    // radius
    // border

    image,

    //stroke,
    //fill,

    grow = 0,
    shrink = 0,
    snap = false,

    children,
  } = props;

  const stroke = [Math.random(), Math.random(), Math.random(), Math.random() + .5];
  const fill = [Math.random(), Math.random(), Math.random(), Math.random() + .5];

  const w = typeof width === 'number' ? width : 0;
  const h = typeof height === 'number' ? height : 0;

  const {id} = useFiber();
  const sizing = [w, h, w, h];

  const margin = normalizeMargin(props.margin ?? 0);
  const radius = normalizeMargin(props.radius ?? 0);
  const border = normalizeMargin(props.border ?? 0);

  return yeet({
    sizing,
    margin,
    grow,
    shrink,
    fit: (into: Point) => {
      const w = width != null ? parseDimension(width, into[0], snap) : into[0];
      const h = height != null ? parseDimension(height, into[1], snap) : into[1];
      const size = [w, h];

      const render = (layout: Rectangle): LiveElement<any> => (
        keyed(Surface, id, {
          id,
          layout,

          stroke,
          fill,
          border,
          radius,

          image,
        })
      );
      return {size, render};
    },
  });
};
