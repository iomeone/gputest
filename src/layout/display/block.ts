import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Rectangle, Point, Point4 } from '@use-gpu/core';
import type { LayoutElement, FitInto, Dimension, Direction, MarginLike, Margin } from '../types';

import { useProp } from '@use-gpu/traits';
import { use, memo, gather, yeet, useFiber, useMemo } from '@use-gpu/live';
import { getBlockMinMax, getBlockMargin, fitBlock } from '../lib/block';
import { isHorizontal, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import type { BoxTrait, ElementTrait } from '../types';
import { useBoxTrait, useElementTrait } from '../traits';
import { evaluateDimension, parseDirectionY, parseMargin } from '../parse';
import { useImplicitElement } from '../element/element';
import { BoxLayout } from '../render';

export type BlockProps =
  Partial<BoxTrait> &
  Partial<ElementTrait> &
{
  direction?: Direction,
  
  padding?: MarginLike,
  snap?: boolean,
  contain?: boolean,
};

export const Block: LiveComponent<BlockProps> = memo((props: PropsWithChildren<BlockProps>) => {
  const {
    snap = true,
    children,
  } = props;

  const { width, height, aspect, radius, border, stroke, fill, image } = useElementTrait(props);
  const { margin: blockMargin, grow, shrink, inline, flex } = useBoxTrait(props);

  const direction = useProp(props.direction, parseDirectionY);
  const padding = useProp(props.padding, parseMargin);

  const contain = props.contain ??
    !!(isHorizontal(direction)
      ? Math.abs(padding[0]) + Math.abs(padding[2])
      : Math.abs(padding[1]) + Math.abs(padding[3]));

  const {id} = useFiber();

  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  const Resume = (els: LayoutElement[]) => {
    return useMemo(() => {
      let w = width != null && width === +width ? width : null;
      let h = height != null && height === +height ? height : null;

      if (aspect != null) {
        if (w != null && h == null) h = w / aspect;
        else if (h != null && w == null) w = h * aspect;
      }

      const fixed = [w, h] as [number | null, number | null];

      const sizing = getBlockMinMax(els, fixed, padding, direction);
      const margin = getBlockMargin(els, blockMargin, padding, direction, contain);

      let ratioX = undefined;
      let ratioY = undefined;
      if (typeof width  === 'string') ratioX = evaluateDimension(width,  1, false);
      if (typeof height === 'string') ratioY = evaluateDimension(height, 1, false);

      const fit = (into: FitInto) => {
        let w = width  != null ? evaluateDimension(width,  into[2], snap) : null;
        let h = height != null ? evaluateDimension(height, into[3], snap) : null;

        if (aspect != null) {
          if (w != null && h == null) {
            h = w / aspect;
            if (snap) h = Math.round(h);
          }
          else if (h != null && w == null) {
            w = h * aspect;
            if (snap) w = Math.round(w);
          }
        }

        const fixed = [w, h] as [number | number, number | null];

        const {size, sizes, offsets, renders, pickers} = fitBlock(els, into, fixed, padding, direction, contain);

        inspect({
          layout: {
            into,
            fixed,
            size,
            sizes,
            offsets,
          },
        });

        const inside = {sizes, offsets, renders};
        return {
          size,
          render: (
            box: Rectangle,
            origin: Rectangle,
            clip?: ShaderModule | null,
            mask?: ShaderModule | null,
            transform?: ShaderModule | null,
          ) => (
            sizes.length ? use(BoxLayout, inside, {box, origin, clip, mask, transform}, hovered) : null
          ),
          pick: makeBoxPicker(id, sizes, offsets, pickers),
        };
      };

      return yeet({        
        sizing,
        margin,
        grow,
        shrink,
        inline,
        flex,
        ratioX,
        ratioY,
        fit: memoFit(fit),
        prefit: memoFit(fit),
      });
    }, [props, els, hovered]);
  };

  const c = useImplicitElement(id, radius, border, stroke, fill, image, children);
  return gather(c, Resume);
}, 'Block');
