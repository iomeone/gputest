import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { UniformType, Rectangle, Point, Point4 } from '@use-gpu/core';
import type { FitInto, Direction, Margin, OverflowMode, LayoutElement, LayoutPicker, LayoutRenderer } from '../types';

import { useProp } from '@use-gpu/traits';
import { memo, use, gather, yeet, extend, useFiber, useOne, useMemo } from '@use-gpu/live';
import { makeShaderBinding } from '@use-gpu/core';
import { bindBundle, bindingToModule, bundleToAttribute, castTo, chainTo } from '@use-gpu/shader/wgsl';
import { useInspectable } from '@use-gpu/workbench';

import { getScrolledPosition } from '@use-gpu/wgsl/layout/scroll.wgsl';
import { getShiftedRectangle } from '@use-gpu/wgsl/layout/shift.wgsl';

import { fitAbsoluteBox } from '../lib/absolute';
import { getBlockMinMax } from '../lib/block';
import { makeBoxLayout, makeBoxPicker, memoFit, memoLayout, isHorizontal } from '../lib/util';
import { parseOverflow } from '../parse';
import { ScrollBar } from '../element/scrollbar';
import { Block } from './block';
import { mat4 } from 'gl-matrix';

const NO_FIXED: [null, null] = [null, null];
const NO_POINT4: Point4 = [0, 0, 0, 0];

const OFFSET_BINDING = bundleToAttribute(getScrolledPosition, 'getOffset');
const CLIP_BINDING = {name: 'getClip', format: 'vec4<f32>' as UniformType};

const SCROLLBAR = use(ScrollBar, {});

export type OverflowProps = {
  x?: OverflowMode,
  y?: OverflowMode,
  
  scrollX?: number,
  scrollY?: number,

  scrollBar?: LiveElement<any>,
  
  direction?: Direction,
  children?: LiveElement<any>,
};

export const Overflow: LiveComponent<OverflowProps> = memo((props: OverflowProps) => {
  const {
    scrollX = 0,
    scrollY = 0,
    scrollBar = SCROLLBAR,
    direction = 'y',
    children,
  } = props;
  
  const x = useProp(props.x, parseOverflow);
  const y = useProp(props.y, parseOverflow);
  
  const isX = isHorizontal(direction);

  const hasScrollX = x === 'scroll' || x === 'auto';
  const hasScrollY = y === 'scroll' || y === 'auto';

  const api = useOne(() => {
    const scrollRef = [0, 0] as Point;
    const offsetRef = [0, 0] as Point;
    const sizeRef = [0, 0, 0, 0] as Point4;
    const clipRef = [0, 0, 0, 0] as Point4;
    const boxRef = [0, 0] as Point;

    const scrollTo = (x?: number | null, y?: number | null) => {
      const [outerWidth, outerHeight, innerWidth, innerHeight] = sizeRef;

      if (x != null) {
        const max = Math.max(0, innerWidth - outerWidth);
        const pos = scrollRef[0] = Math.max(0, Math.min(max, x));
        offsetRef[0] = -pos;
        clipRef[0] = pos;
        clipRef[2] = pos + outerWidth;
      }

      if (y != null) {
        const max = Math.max(0, innerHeight - outerHeight);
        const pos = scrollRef[1] = Math.max(0, Math.min(max, y));
        offsetRef[1] = -pos;
        clipRef[1] = pos;
        clipRef[3] = pos + outerHeight;
      }
    };

    const scrollBy = (dx?: number | null, dy?: number | null) => {
      scrollTo(
        dx != null ? scrollRef[0] + dx : null,
        dy != null ? scrollRef[1] + dy : null,
      );
    };

    const shouldScroll = () => {
      const [outerWidth, outerHeight, innerWidth, innerHeight] = sizeRef;
      return [outerWidth < innerWidth, outerHeight < innerHeight];
    };
    
    const fitTo = (layout: Rectangle, size: Point, scrollBarWidth: number, scrollBarHeight: number) => {
      const before = shouldScroll();
      const [l, t, r, b] = layout;
      boxRef[0] = l;
      boxRef[1] = t;
      sizeRef[0] = r - l;
      sizeRef[1] = b - t;
      sizeRef[2] = size[0];
      sizeRef[3] = size[1];

      const after = shouldScroll();
      sizeRef[0] = r - l - (after[1] ? scrollBarWidth : 0);
      sizeRef[1] = b - t - (after[0] ? scrollBarHeight : 0);

      const [x, y] = scrollRef;
      scrollTo(x, y);
      
      return (isX && before[0] !== after[0]) || (!isX && before[1] !== after[1]);
    };

    const c = bindingToModule(makeShaderBinding<ShaderModule>(CLIP_BINDING, clipRef));
    const b = bindingToModule(makeShaderBinding<ShaderModule>(OFFSET_BINDING, boxRef));
    const o = bindingToModule(makeShaderBinding<ShaderModule>(OFFSET_BINDING, offsetRef));
    const s = bindingToModule(makeShaderBinding<ShaderModule>(OFFSET_BINDING, scrollRef));

    const shift = bindBundle(getShiftedRectangle, {getOffset: b});
    const clip = chainTo(c, shift);

    const transform = bindBundle(getScrolledPosition, {getOffset: o});
    const inverse = bindBundle(getScrolledPosition, {getOffset: s});

    return {clip, transform, inverse, sizeRef, scrollRef, shouldScroll, fitTo, scrollTo, scrollBy};
  });
  
  const {clip, transform, inverse, sizeRef, scrollRef, shouldScroll, fitTo, scrollTo, scrollBy} = api;

  useOne(() => scrollTo(scrollX, null), scrollX);
  useOne(() => scrollTo(null, scrollY), scrollY);

  const {id} = useFiber();
  const inspect = useInspectable();

  const Resume = (els: LayoutElement[]) => {
    return useMemo(() => {
      const sizing = getBlockMinMax(els, NO_FIXED, [0, 0, 0, 0], direction);
      const [{margin, fit: fitBlock}, ...scrollBars] = els;
      const [ml, mt, mr, mb] = margin;

      const scrollBarWidth  = hasScrollY ? scrollBars[hasScrollX ? 1 : 0].sizing[2] : 0;
      const scrollBarHeight = hasScrollX ? scrollBars[0].sizing[3] : 0;

      const fit = (into: FitInto) => {
          const sizes   = [] as Point[];
          const offsets = [] as Point[];
          const renders = [] as (LayoutRenderer[]);
          const pickers = [] as (LayoutPicker | null | undefined)[];

          const fit = () => {
            sizes.length = 0;
            offsets.length = 0;
            renders.length = 0;
            pickers.length = 0;

            const [shouldScrollX, shouldScrollY] = shouldScroll();

            const padX = (shouldScrollY ? scrollBarWidth  : 0);
            const padY = (shouldScrollX ? scrollBarHeight : 0);

            const resolved: FitInto = isX
              ? [null, into[1] != null ? into[1] - padX : null, into[2] - padX, into[3] - padY]
              : [into[0] != null ? into[0] - padX : null, null, into[2] - padX, into[3] - padY];

            const {render, pick, size} = fitBlock(resolved);

            sizes.push(size);
            offsets.push([ml, mt]);
            renders.push(render);
            pickers.push(pick);

            for (const {fit} of scrollBars) {
              const {render, pick, size} = fit(into);
              sizes.push(size);
              offsets.push([0, 0]);
              renders.push(render);
              pickers.push(null);
            }

            inspect({
              layout: {
                into,
                size,
                sizes,
                offsets,
              },
            });

            const outer = size.slice() as Point;
            if (shouldScrollY) outer[0] += scrollBarWidth;
            if (shouldScrollX) outer[1] += scrollBarHeight;

            return [outer, size];
          };
          
          const [outer, size] = fit();

          return {
            size: outer,
            render: memoLayout((
              box: Rectangle,
              parentClip?: ShaderModule,
              parentTransform?: ShaderModule,
            ) => {

              // If scrollbar must appear/disappear, re-fit.
              if (fitTo(box, size, scrollBarWidth, scrollBarHeight) && (hasScrollX || hasScrollY)) {
                fitTo(box, fit()[1], scrollBarWidth, scrollBarHeight);
              }

              return [
                ...makeBoxLayout([sizes[0]], [offsets[0]], [renders[0]], clip, transform, inverse)(box, parentClip, parentTransform),
                ...makeBoxLayout(sizes.slice(1), offsets.slice(1), renders.slice(1))(box, parentClip, parentTransform),
              ];
            }),
            pick: makeBoxPicker(id, sizes, offsets, pickers, scrollRef, scrollBy),
          };
        };

      return yeet({
        sizing,
        margin: NO_POINT4,
        stretch: true,
        fit: memoFit(fit),
        prefit: memoFit(fit),
      });
    }, [props, els]);
  };

  const scrollBarX = hasScrollX ? extend(scrollBar, { direction: 'x', overflow: x, scrollRef, sizeRef }) : null;
  const scrollBarY = hasScrollY ? extend(scrollBar, { direction: 'y', overflow: y, scrollRef, sizeRef }) : null;

  return children ? gather([
    use(Block, {contain: true, direction, children}),
    scrollBarX,
    scrollBarY,
  ], Resume) : null;
}, 'Overflow');
