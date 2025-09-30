import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { ColorLike, XYZW, Rectangle } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { MarginLike, AutoXY } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { use, yeet, useFiber, useMemo } from '@use-gpu/live';
import { evaluateDimension } from '../parse';
import { useInspectHoverable, LayerReconciler } from '@use-gpu/workbench';

import { BoxTrait, ElementTrait, ImageTrait, useBoxTrait, useElementTrait } from '../traits';
import { INSPECT_STYLE } from '../lib/constants';
import { memoLayout } from '../lib/util';

import { SDFRectangle } from '../shape/sdf-rectangle';

const {quote} = LayerReconciler;

export type ElementProps =
  TraitProps<typeof BoxTrait> &
  TraitProps<typeof ElementTrait> &
PropsWithChildren<{
  snap?: boolean,
  absolute?: boolean,
  under?: boolean,
}>;

const TRANSPARENT: XYZW = [0, 0, 0, 0];

export const Element: LiveComponent<ElementProps> = (props: ElementProps) => {
  const {
    snap = false,
    absolute = false,
    under = false,
  } = props;

  const { width, height, radius, border, stroke, fill, texture, image, zIndex } = useElementTrait(props);
  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const w = typeof width === 'number' ? width : 0;
  const h = typeof height === 'number' ? height : 0;

  const sizing = [w, h, w, h];

  const hovered = useInspectHoverable();

  const {id} = useFiber();

  const fit = (into: AutoXY) => {
    const w = width != null ? evaluateDimension(width, into[0] || 0, snap) : into[0] || 0;
    const h = height != null ? evaluateDimension(height, into[1] || 0, snap) : into[1] || 0;
    const size = [w ?? 0, h ?? 0];

    const render = memoLayout((
      layout: Rectangle,
      origin: Rectangle,
      z: number,
      clip: ShaderModule | null,
      mask: ShaderModule | null,
      transform: ShaderModule | null,
    ): LiveElement => (
      quote(use(SDFRectangle, {
        layout,
        origin,

        stroke: hovered ? INSPECT_STYLE.parent.stroke : stroke ?? TRANSPARENT,
        fill:   hovered ? INSPECT_STYLE.parent.fill : fill ?? TRANSPARENT,
        border: hovered ? INSPECT_STYLE.parent.border : border ?? TRANSPARENT,
        radius,

        texture,
        image,
        clip,
        mask,
        transform,
        zIndex: z + zIndex,
      }),
    )));

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
  {radius, border, stroke, fill, image, texture, children}: {
    radius?: MarginLike,
    border?: MarginLike,
    stroke?: ColorLike,
    fill?: ColorLike,
    image?: Partial<TraitProps<typeof ImageTrait>>,
    texture?: ShaderSource | null | undefined,
    children?: any,
  },
) =>
  useMemo(() => {
    const element = (stroke || fill || image) ? (
      use(Element, {radius, border, stroke, fill, image, texture, absolute: true, under: true})
    ) : null;
    return element && children ? [element, children] : element ?? children;
  }, [radius, border, stroke, fill, texture, image, children]);
