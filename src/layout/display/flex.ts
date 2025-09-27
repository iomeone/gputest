import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { LayoutElement, Margin, Dimension, Direction, Alignment, AlignmentLike, GapLike, Anchor, FitInto } from '../types';

import { useProp } from '@use-gpu/traits';
import { use, yeet, memo, gather, useFiber, useMemo } from '@use-gpu/live';
import { getFlexMinMax, fitFlex } from '../lib/flex';
import { makeBoxLayout, makeBoxInspectLayout, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import type { BoxTrait, ElementTrait } from '../types';
import { useBoxTrait, useElementTrait } from '../traits';
import { evaluateDimension, parseAlignmentXY, parseAnchor, parseDirectionX, parseGapXY, parseMargin } from '../parse';
import { useImplicitElement } from '../element/element';

const NO_MARGIN = [0, 0, 0, 0] as Margin;

export type FlexProps =
  Partial<BoxTrait> &
  Partial<ElementTrait> &
{
  direction?: Direction,

  gap?: GapLike,
  align?: AlignmentLike,
  anchor?: Anchor,

  wrap?: boolean,
  snap?: boolean,
  children?: LiveElement<any>,
};

export const Flex: LiveComponent<FlexProps> = memo((props: FlexProps) => {
  const {
    wrap = false,
    snap = true,
    children,
  } = props;

  const { width, height, radius, border, stroke, fill, image } = useElementTrait(props);
  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const direction = useProp(props.direction, parseDirectionX);
  const align     = useProp(props.align, parseAlignmentXY);
  const anchor    = useProp(props.anchor, parseAnchor);
  const gap       = useProp(props.gap, parseGapXY);

  const {id} = useFiber();

  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  const Resume = (els: LayoutElement[]) => {
    return useMemo(() => {
      const w = width != null && width === +width ? width : null;
      const h = height != null && height === +height ? height : null;

      const fixed = [w, h] as [number | null, number | null];

      const sizing = getFlexMinMax(els, fixed, direction, gap, wrap, snap);

      let ratioX = undefined;
      let ratioY = undefined;
      if (typeof width  === 'string') ratioX = evaluateDimension(width,  1, false) ?? 1;
      if (typeof height === 'string') ratioY = evaluateDimension(height, 1, false) ?? 1;

      const fit = (into: FitInto) => {
          const w = width  != null ? evaluateDimension(width, into[2], snap) : null;
          const h = height != null ? evaluateDimension(height, into[3], snap) : null;
          const fixed = [w, h] as [number | number, number | null];

          const {size, sizes, offsets, renders, pickers} = fitFlex(els, into, fixed, direction, gap, align[0], align[1], anchor, wrap, snap);

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

          return self;
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
  return c ? gather(c, Resume) : null;
}, 'Flex');
