import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Rectangle } from '@use-gpu/core';
import type { LayoutElement, Direction, AlignmentLike, GapLike, Anchor, FitInto } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { useProp, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { keyed, yeet, memo, gather, useFiber, useMemo } from '@use-gpu/live';
import { getFlexMinMax, fitFlex } from '../lib/flex';
import { makeBoxPicker, memoFit } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import { BoxTrait, ElementTrait, useBoxTrait, useElementTrait } from '../traits';
import { evaluateDimension, parseAlignmentXY, parseAnchor, parseDirectionX, parseGapXY } from '../parse';
import { useImplicitElement } from '../element/element';
import { BoxLayout } from '../render';

export type FlexProps =
  TraitProps<typeof BoxTrait> &
  TraitProps<typeof ElementTrait> &
PropsWithChildren<{
  direction?: Direction,

  gap?: GapLike,
  align?: AlignmentLike,
  anchor?: Anchor,

  wrap?: boolean,
  snap?: boolean,
}>;

export const Flex: LiveComponent<FlexProps> = memo((props: FlexProps) => {
  const {
    wrap = false,
    snap = true,
  } = props;

  const { width, height, aspect, zIndex } = useElementTrait(props);
  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const direction = useProp(props.direction, parseDirectionX);
  const align     = useProp(props.align, parseAlignmentXY);
  const anchor    = useProp(props.anchor, parseAnchor);
  const gap       = useProp(props.gap, parseGapXY);

  const {id} = useFiber();

  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  const c = useImplicitElement(props);

  const Resume = (els: LayoutElement[]) => {
    return useMemo(() => {
      let w = width != null && width === +width ? width : null;
      let h = height != null && height === +height ? height : null;

      if (aspect != null) {
        if (w != null && h == null) h = w / aspect;
        else if (h != null && w == null) w = h * aspect;
      }

      const fixed = [w, h] as [number | null, number | null];

      const sizing = getFlexMinMax(els, fixed, direction, gap, wrap, snap);

      let ratioX = undefined;
      let ratioY = undefined;
      if (typeof width  === 'string') ratioX = evaluateDimension(width,  1, false) ?? 1;
      if (typeof height === 'string') ratioY = evaluateDimension(height, 1, false) ?? 1;

      const fit = (into: FitInto) => {
        let w = width  != null ? evaluateDimension(width, into[2], snap) : null;
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

        const inside = {sizes, offsets, renders};
        return {
          size,
          render: (
            box: Rectangle,
            origin: Rectangle,
            z: number,
            clip?: ShaderModule | null,
            mask?: ShaderModule | null,
            transform?: ShaderModule | null,
          ) => (
            sizes.length ? keyed(BoxLayout, id, inside, {box, origin, z: z + zIndex, clip, mask, transform}, hovered) : null
          ),
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
    }, [props, els, hovered, zIndex]);
  };

  return c ? gather(c, Resume) : null;
}, shouldEqual({
  padding: sameShallow(),
  margin:  sameShallow(),
  radius:  sameShallow(),
  border:  sameShallow(),
  stroke:  sameShallow(),
  fill:    sameShallow(),
  image:   sameShallow(),
}), 'Flex');
