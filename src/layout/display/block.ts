import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Point, Point4 } from '@use-gpu/core';
import type { LayoutElement, FitInto, Dimension, Direction, MarginLike, Margin } from '../types';

import { useProp } from '@use-gpu/traits';
import { use, memo, gather, yeet, useFiber, useMemo } from '@use-gpu/live';
import { getBlockMinMax, getBlockMargin, fitBlock } from '../lib/block';
import { isHorizontal, makeBoxLayout, makeBoxInspectLayout, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import type { BoxTrait, ElementTrait } from '../types';
import { useBoxTrait, useElementTrait } from '../traits';
import { evaluateDimension, parseDirectionY, parseMargin } from '../parse';
import { useImplicitElement } from '../element/element';

export type BlockProps =
  Partial<BoxTrait> &
  Partial<ElementTrait> &
{
  direction?: Direction,
  
  padding?: MarginLike,
  snap?: boolean,
  contain?: boolean,

  children?: LiveElement<any>,
};

export const Block: LiveComponent<BlockProps> = memo((props: BlockProps) => {
  const {
    snap = true,
    children,
  } = props;

  const { width, height, radius, border, stroke, fill, image } = useElementTrait(props);
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
      const w = width != null && width === +width ? width : null;
      const h = height != null && height === +height ? height : null;

      const fixed = [w, h] as [number | null, number | null];

      const sizing = getBlockMinMax(els, fixed, padding, direction);
      const margin = getBlockMargin(els, blockMargin, padding, direction, contain);

      let ratioX = undefined;
      let ratioY = undefined;
      if (typeof width  === 'string') ratioX = evaluateDimension(width,  1, false);
      if (typeof height === 'string') ratioY = evaluateDimension(height, 1, false);

      const fit = (into: FitInto) => {
          const w = width != null ? evaluateDimension(width, into[2], snap) : null;
          const h = height != null ? evaluateDimension(height, into[3], snap) : null;
          const fixed = [
            width != null ? w : null,
            height != null ? h : null,
          ] as [number | number, number | null];

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

          return {
            size,
            render: memoLayout(hovered ? makeBoxInspectLayout(id, sizes, offsets, renders) : makeBoxLayout(sizes, offsets, renders)),
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
