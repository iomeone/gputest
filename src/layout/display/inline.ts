import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Point, Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { InlineElement, LayoutPicker, LayoutRenderer, FitInto, Direction, Alignment, Base, MarginLike } from '../types';

import { useProp } from '@use-gpu/traits';
import { memo, gather, yeet, useFiber, useOne, useMemo } from '@use-gpu/live';
import { getInlineMinMax, fitInline, resolveInlineBlockElements } from '../lib/inline';
import { makeInlineLayout, makeInlineInspectLayout, makeBoxLayout, makeBoxInspectLayout, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

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
  children?: LiveElement<any>,
};

export const Inline: LiveComponent<InlineProps> = memo((props: InlineProps) => {
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

          return {
            size,
            render: memoLayout((
              box: Rectangle,
              clip?: ShaderModule,
              transform?: ShaderModule,
            ) => {
              if (hovered) {
                const out = makeInlineInspectLayout(id, ranges, sizes, offsets, renders, key)(box, clip, transform);
                if (sizes.length) out.push(...makeBoxLayout(blockSizes, blockOffsets, blockRenders)(box, clip, transform));
                return out;
              }
              else {
                const out = makeInlineLayout(ranges, sizes, offsets, renders, key)(box, clip, transform);
                if (sizes.length) out.push(...makeBoxLayout(blockSizes, blockOffsets, blockRenders)(box, clip, transform));
                return out;
              }
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
