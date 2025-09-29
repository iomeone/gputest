import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Point, Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { InlineElement, LayoutPicker, LayoutRenderer, FitInto, Direction, Alignment, Base, MarginLike } from '../types';

import { useProp } from '@use-gpu/traits';
import { use, memo, gather, yeet, useFiber, useOne, useMemo } from '@use-gpu/live';
import { getInlineMinMax, fitInline, resolveInlineBlockElements } from '../lib/inline';
import { makeInlineLayout, makeInlineInspectLayout, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import { BoxLayout, InlineLayout } from '../render';

import type { BoxTrait } from '../types';
import { useBoxTrait } from '../traits';
import { parseAlignment, parseBase, parseDirectionX, parseMargin } from '../parse';

export type InlineProps = Partial<BoxTrait> & {
  direction?: Direction,

  align?: Alignment,
  anchor?: Base,
  padding?: MarginLike,

  wrap?: boolean,
  snap?: boolean,
};

export const Inline: LiveComponent<InlineProps> = memo((props: PropsWithChildren<InlineProps>) => {
  const {
    wrap = true,
    snap = true,
    children,
  } = props;

  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const direction = useProp(props.direction, parseDirectionX);
  const padding = useProp(props.padding, parseMargin);
  const anchor = useProp(props.anchor, parseBase, 'base');
  const align = useProp(props.align, parseAlignment);

  const {id} = useFiber();
  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  const Resume = (els: InlineElement[]) => {
    return useMemo(() => {
      const inlineEls = resolveInlineBlockElements(els, direction);
      const blockEls = inlineEls.filter(el=> !!el.block);

      const sizing = getInlineMinMax(inlineEls, direction, wrap, snap);

      const fit = (into: FitInto) => {
          const {size, sizes, ranges, offsets, anchors, renders, pickers, key} =
            fitInline(inlineEls, into, direction, align, anchor, wrap, snap);

          const blockSizes: Point[] = [];
          const blockOffsets: Point[] = [];
          const blockRenders: LayoutRenderer[] = [];
          const blockPickers: (LayoutPicker | null | undefined)[] = [];

          let i = 0;
          for (const el of blockEls) {
            const {block} = el;
            const {size, render, pick} = block!;

            blockSizes.push(size);
            blockOffsets.push(anchors[i++]);
            blockRenders.push(render);
            blockPickers.push(pick);
          }
      
          inspect({
            layout: {
              into,
              size,
              sizes,
              offsets,
            },
          });
      
          const pickSizes   = blockSizes.length ? [...sizes,   ...blockSizes] : sizes;
          const pickOffsets = blockSizes.length ? [...offsets, ...blockOffsets] : offsets;
          const pickPickers = blockSizes.length ? [...pickers, ...blockPickers] : pickers;

          const inside = {
            sizes: blockSizes,
            offsets: blockOffsets,
            renders: blockRenders,
          };
          
          const inline = {ranges, sizes, offsets, renders, key};

          return {
            size,
            render: memoLayout((
              box: Rectangle,
              origin: Rectangle,
              clip: ShaderModule | null,
              mask: ShaderModule | null,
              transform: ShaderModule | null,
            ) => {
              const el = use(InlineLayout, inline, {box, origin, clip, mask, transform}, hovered);
              if (sizes.length) return [
                el,
                use(BoxLayout, inside, {
                  box,
                  origin,
                  clip,
                  mask,
                  transform,
                })
              ];
              return el;
            }),
            pick: makeBoxPicker(id, pickSizes, pickOffsets as any, pickPickers),
          };
        };

      return yeet({
        sizing,
        margin,
        grow,
        shrink,
        inline,
        flex,
        fit: memoFit(fit),
        prefit: memoFit(fit),
      });
    }, [props, els, hovered]);
  };
  
  return children ? gather(children, Resume) : null;
}, 'Inline');
