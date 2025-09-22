import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { ElementStyle, LayoutState, LayoutResult, Margin, Rectangle, Point } from './types';

import { use, yeet, useFiber, useMemo } from '@use-gpu/live';
import { parseDimension, normalizeMargin } from './lib/util';

import { Surface } from './surface';

export type ElementProps = {
  width?: Dimension,
  height?: Dimension,
  margin?: number | Point4,
  radius?: number | Point4,
  border?: number | Point4,
  stroke?: Point4,
  fill?: Point4,

  backgroundImage?: TextureSource,
  backgroundFit?: Fit,
  backgroundRepeat?: Repeat,
  backgroundAlign?: Anchor | [Anchor, Anchor],

  grow?: number,
  shrink?: number,
  snap?: boolean,

  children?: LiveElement<any>,
};

export const Element: LiveComponent<BlockProps> = (props) => {
  const {
    width,
    height,
    // margin
    // radius
    // border

    image,
    imageFit,
    imageRepeat,
    imageAlign,

    borderColor,

    grow = 0,
    shrink = 0,
    snap = false,

    children,
  } = props;

  const w = typeof width === 'number' ? width : 0;
  const h = typeof height === 'number' ? height : 0;

  const fiber = useFiber();
  const sizing = [w, h, w, h];

  const margin = normalizeMargin(props.margin ?? 0);
  const radius = normalizeMargin(props.radius ?? 0);
  const border = normalizeMargin(props.border ?? 0);

  return yeet({
    sizing,
    margin,
    grow,
    shrink,
    fit: (into: Point): Point => {
      const w = width != null ? parseDimension(width, into[0], snap) : into[0];
      const h = height != null ? parseDimension(height, into[1], snap) : into[1];
      const size = [w, h];

      const render = (layout: Rectangle): LiveElement<any> => (
        use(Surface, fiber.id)({
          layout,

          fill: [Math.random(), Math.random(), Math.random(), Math.random() + .5],
          stroke: [Math.random(), Math.random(), Math.random(), Math.random() + .5],
          border,
          radius,

          image,
          imageFit,
          imageRepeat,
          imageAlign,
        })
      );
      return {size, render};
    },
  });
};
