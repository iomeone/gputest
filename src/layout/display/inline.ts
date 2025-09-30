import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { XY, Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { InlineElement, LayoutPicker, LayoutRenderer, FitInto, Direction, Alignment, Baseline } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { useProp } from '@use-gpu/traits/live';
import { keyed, fragment, use, memo, gather, yeet, useFiber, useMemo } from '@use-gpu/live';
import { getInlineMinMax, fitInline, resolveInlineBlockElements } from '../lib/inline';
import { makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import { BoxLayout, InlineLayout } from '../render';

import { BoxTrait, useBoxTrait } from '../traits';
import { parseAlignment, parseBaseline, parseDirectionX } from '../parse';

export type InlineProps =
  TraitProps<typeof BoxTrait> &
PropsWithChildren<{
  direction?: Direction,

  align?: Alignment,
  anchor?: Baseline,

  wrap?: boolean,
  snap?: boolean,
}>;

export const Inline: LiveComponent<InlineProps> = memo((props: InlineProps) => {
  const {
    wrap = true,
    snap = true,
    children,
  } = props;

  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const direction = useProp(props.direction, parseDirectionX);
  const anchor = useProp(props.anchor, parseBaseline, 'base');
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

          const blockSizes: XY[] = [];
          const blockOffsets: XY[] = [];
          const blockRenders: LayoutRenderer[] = [];
          const blockPickers: (LayoutPicker | null | undefined)[] = [];

          let i = 0;
          for (const el of blockEls) {
            const {block} = el;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
              z: number,
              clip: ShaderModule | null,
              mask: ShaderModule | null,
              transform: ShaderModule | null,
            ) => {
              const el = keyed(InlineLayout, id, inline, {box, origin, z, clip, mask, transform}, hovered);
              if (blockSizes.length) return fragment([
                el,
                use(BoxLayout, inside, {
                  box,
                  origin,
                  z,
                  clip,
                  mask,
                  transform,
                })
              ], id);
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
