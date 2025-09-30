import type { LiveComponent } from '@use-gpu/live';
import type { ColorLike, XY, XYZW, Rectangle, TypedArray } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { Direction, OverflowMode, FitInto, UIAggregate } from '../types';

import { useProp } from '@use-gpu/traits/live';
import { parseColor } from '@use-gpu/parse';
import { yeet, use, useMemo } from '@use-gpu/live';
import { schemaToArchetype } from '@use-gpu/core';
import { useInspectHoverable, UI_SCHEMA } from '@use-gpu/workbench';

import { isHorizontal, memoFit } from '../lib/util';
import { INSPECT_STYLE } from '../lib/constants';

import { chainTo } from '@use-gpu/shader/wgsl';
import { useShader, LayerReconciler } from '@use-gpu/workbench';

import { getScrolledPosition } from '@use-gpu/wgsl/layout/scroll.wgsl';

const {quote} = LayerReconciler;

export type ScrollBarProps = {
  direction?: Direction,

  size?: number,
  track?: ColorLike,
  thumb?: ColorLike,

  overflow?: OverflowMode,
  scrollRef?: XY,
  sizeRef?: XYZW,
  transform?: ShaderModule,
};

const NO_POINT: XY = [0, 0];

const NO_POINT4: XYZW = [0, 0, 0, 0];
const TRACK: XYZW = [0, 0, 0, .5];
const THUMB: XYZW = [1, 1, 1, .5];

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
        z: number,
        clip?: ShaderModule,
        mask?: ShaderModule,
        transform?: ShaderModule,
      ) => (
        quote(use(Bar, sizeRef, scrollRef, overflow, size, track, thumb, isX, layout, origin, z, clip, mask, transform, hovered))
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

const Bar = (
  sizeRef: XYZW,
  scrollRef: XY,

  overflow: OverflowMode,
  size: number,
  track: TypedArray,
  thumb: TypedArray,
  isX: boolean,

  layout: Rectangle,
  origin: Rectangle,
  z: number,
  clip?: ShaderModule,
  mask?: ShaderModule,
  transform?: ShaderModule,

  inspect?: boolean,
) => {
  const shift = useMemo(() => isX
    ? () => [scrollRef[0] / sizeRef[2] * sizeRef[0], 0]
    : () => [0, scrollRef[1] / sizeRef[3] * sizeRef[1]],
    [scrollRef, sizeRef]
  );

  const thumbTransform = useShader(getScrolledPosition, [shift]);

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
    if (showTrack) {
      const attributes = {
        rectangle: trackBox,
        uv: [0, 0, 1, 1],
        fill:   track as any,
        radius: [size/2, size/2, size/2, size/2] as Rectangle,
        ...(inspect ? INSPECT_STYLE.parent : undefined),
      };

      yeets.push({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),

        attributes,
        bounds: trackBox,
        clip,
        mask,
        transform,
        zIndex: z,
      });
    }
    if (showThumb) {
      const attributes = {
        rectangle: thumbBox,
        uv: [0, 0, 1, 1],
        fill:   thumb as any,
        radius: [size/2, size/2, size/2, size/2] as Rectangle,
        ...(inspect ? INSPECT_STYLE.parent : undefined),
      };

      yeets.push({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),

        attributes,
        bounds: thumbBox,
        clip,
        mask,
        transform: transform ? chainTo(transform, thumbTransform) : thumbTransform,
        zIndex: z,
      });
    }
    return yeet(yeets);
  }, [...sizeRef, thumbTransform, overflow, isX, layout, origin, z, clip, mask, transform, inspect]);
}
