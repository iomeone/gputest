import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TextureSource, Point, Point4, Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { ColorLike } from '@use-gpu/traits';
import type { Direction, OverflowMode, FitInto, UIAggregate } from '../types';

import { parseColor, useProp } from '@use-gpu/traits';
import { keyed, yeet, use, useFiber, useMemo } from '@use-gpu/live';
import { makeShaderBinding } from '@use-gpu/core';
import { evaluateDimension } from '../parse';
import { isHorizontal, memoFit } from '../lib/util';
import { useInspectHoverable } from '@use-gpu/workbench';

import { INSPECT_STYLE } from '../lib/constants';

import { UIRectangle } from '../shape/ui-rectangle';
import { chainTo } from '@use-gpu/shader/wgsl';
import { useBoundShader } from '@use-gpu/workbench';

import { getScrolledPosition } from '@use-gpu/wgsl/layout/scroll.wgsl';

export type ScrollBarProps = {
  direction?: Direction,

  size?: number,
  track?: ColorLike,
  thumb?: ColorLike,

  overflow?: OverflowMode,
  scrollRef?: Point,
  sizeRef?: Point4,
  transform?: ShaderModule,
};

const NO_POINT: Point = [0, 0];

const NO_POINT4: Point4 = [0, 0, 0, 0];
const TRACK: Point4 = [0, 0, 0, .5];
const THUMB: Point4 = [1, 1, 1, .5];

export const ScrollBar: LiveComponent<ScrollBarProps> = (props) => {
  const {
    direction = 'y',
    size = 10,
    
    overflow = 'scroll',
    scrollRef = NO_POINT,
    sizeRef = NO_POINT4,
  } = props;

  const hovered = useInspectHoverable();

  const track = useProp(props.track, parseColor, TRACK);
  const thumb = useProp(props.thumb, parseColor, THUMB);

  const isX = isHorizontal(direction);

  const fit = (into: FitInto) => {
    return {
      size: [into[2], into[3]],
      render: (
        layout: Rectangle,
        origin: Rectangle,
        clip?: ShaderModule,
        mask?: ShaderModule,
        transform?: ShaderModule,
      ) => (
        use(Render, sizeRef, scrollRef, overflow, size, track, thumb, isX, layout, origin, clip, mask, transform, hovered)
      ),
      /*
      pick: (x: number, y: number, l: number, t: number, r: number, b: number, scroll?: boolean) => {
        if (x < l || x > r || y < t || y > b) return null;
        return !scroll ? [id, [l, t, r, b]] : null;
      },
      */
    };
  };

  return yeet({
    sizing: isX ? [0, size, 0, size] : [size, 0, size, 0],
    margin: NO_POINT4,
    absolute: true,
    fit: memoFit(fit),
    prefit: memoFit(fit),
  });
};

const Render = (
  sizeRef: Point4,
  scrollRef: Point,

  overflow: OverflowMode,
  size: number,
  track: ColorLike,
  thumb: ColorLike,
  isX: boolean,

  layout: Rectangle,
  origin: Rectangle,
  clip?: ShaderModule,
  mask?: ShaderModule,
  transform?: ShaderModule,

  inspect?: boolean,
) => {
  const {id} = useFiber();

  const shift = useMemo(() => isX
    ? () => [scrollRef[0] / sizeRef[2] * sizeRef[0], 0]
    : () => [0, scrollRef[1] / sizeRef[3] * sizeRef[1]],
    [scrollRef, sizeRef]
  );

  const thumbTransform = useBoundShader(getScrolledPosition, [shift]);

  return useMemo(() => {
    const [outerWidth, outerHeight, innerWidth, innerHeight] = sizeRef;

    const w = isX ? outerWidth : size;
    const h = isX ? size : outerHeight;

    const [l, t, r, b] = layout;        
    const ll = isX ? l : r - w;
    const tt = isX ? b - h : t;

    const f = Math.min(1, isX ? outerWidth / innerWidth : outerHeight / innerHeight);
    const rr = isX ? l + (r - l) * f : r;
    const bb = isX ? b : t + (b - t) * f;

    const trackBox = [ll, tt, r, b] as Rectangle;
    const thumbBox = [ll, tt, rr, bb] as Rectangle;

    const showTrack = overflow === 'scroll' || f < 1;
    const showThumb = showTrack && f < 1;

    const yeets: UIAggregate[] = [];
    if (showTrack) yeets.push({
      id: id.toString() + '-0',
      rectangle: trackBox,
      bounds: trackBox,
      uv: [0, 0, 1, 1],
      fill:   track as any,
      radius: [size/2, size/2, size/2, size/2] as Rectangle,
      ...(inspect ? INSPECT_STYLE.parent : undefined),

      clip,
      mask,
      transform,
      count: 1,
    });
    if (showThumb) yeets.push({
      id: id.toString() + '-1',
      rectangle: thumbBox,
      bounds: thumbBox,
      uv: [0, 0, 1, 1],
      fill:   thumb as any,
      radius: [size/2, size/2, size/2, size/2] as Rectangle,
      ...(inspect ? INSPECT_STYLE.parent : undefined),

      clip,
      mask,
      transform: transform ? chainTo(transform, thumbTransform) : thumbTransform,
      count: 1,
    });
    return yeet(yeets);
  }, [...sizeRef, thumbTransform, overflow, isX, layout, origin, clip, mask, transform, inspect]);
}
