import type { LiveComponent, LiveElement, PropsWithChildren } from '../../live';
import type { TextureSource, Point4, Rectangle } from '../../core';
import type { ShaderModule } from '../../shader';
import type { ColorLike } from '../../traits';
import type { Dimension, Margin, MarginLike, Base, Fit, Repeat, Anchor, AutoPoint, ImageTrait } from '../types';

import { use, keyed, yeet, useFiber, useMemo } from '../../live';
import { evaluateDimension } from '../parse';
import { useInspectHoverable } from '../../workbench';

import type { BoxTrait, ElementTrait } from '../types';
import { useBoxTrait, useElementTrait } from '../traits';
import { INSPECT_STYLE } from '../lib/constants';
import { memoLayout } from '../lib/util';

import { UIRectangle } from '../shape/ui-rectangle';

export type ElementProps = Partial<BoxTrait> & Partial<ElementTrait> & {
  id?: number,
  snap?: boolean,
  absolute?: boolean,
  under?: boolean,
};

const TRANSPARENT: Point4 = [0, 0, 0, 0];

export const Element: LiveComponent<ElementProps> = (props: PropsWithChildren<ElementProps>) => {
  const {
    snap = false,
    absolute = false,
    under = false,

    children,
  } = props;

  const { width, height, radius, border, stroke, fill, image } = useElementTrait(props);
  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const w = typeof width === 'number' ? width : 0;
  const h = typeof height === 'number' ? height : 0;

  const {id: fiberId} = useFiber();
  const id = props.id ?? fiberId;
  const sizing = [w, h, w, h];

  const hovered = useInspectHoverable();

  const fit = (into: AutoPoint) => {
    const w = width != null ? evaluateDimension(width, into[0] || 0, snap) : into[0] || 0;
    const h = height != null ? evaluateDimension(height, into[1] || 0, snap) : into[1] || 0;
    const size = [w ?? 0, h ?? 0];

    let render = memoLayout((
      layout: Rectangle,
      origin: Rectangle,
      clip: ShaderModule | null,
      mask: ShaderModule | null,
      transform: ShaderModule | null,
    ): LiveElement => (
      keyed(UIRectangle, id, {
        id,
        layout,
        origin,

        stroke: hovered ? INSPECT_STYLE.parent.stroke : stroke ?? TRANSPARENT,
        fill:   hovered ? INSPECT_STYLE.parent.fill : fill ?? TRANSPARENT,
        border: hovered ? INSPECT_STYLE.parent.border : border ?? TRANSPARENT,
        radius,

        image,
        clip,
        mask,
        transform,
      })
    ));

    return {
      size,
      render,
      pick: (x: number, y: number, l: number, t: number, r: number, b: number, scroll?: boolean) => {
        if (x < l || x > r || y < t || y > b) return null;
        return !scroll ? [id, [l, t, r, b]] : null;
      },
    };
  };

  return yeet({
    sizing,
    margin,
    grow,
    shrink,
    absolute,
    under,
    inline,
    flex,
    fit,
  });
};

export const useImplicitElement = (
  id: number,
  radius: MarginLike,
  border: MarginLike,
  stroke: ColorLike,
  fill: ColorLike,
  image: Partial<ImageTrait>,
  children: any,
) =>
  useMemo(() => {
    const element = (stroke || fill || image) ? (
      use(Element, {id, radius, border, stroke, fill, image, absolute: true, under: true})
    ) : null;
    return element && children ? [element, children] : element ?? children;
  }, [id, radius, border, stroke, fill, image, children]);
