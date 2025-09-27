import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Rectangle, Point, Point4 } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { FitInto, LayoutElement, Dimension, Margin } from '../types';

import { useProp } from '@use-gpu/traits';
import { use, memo, gather, provide, yeet, tagFunction, useContext, useFiber } from '@use-gpu/live';
import { LayoutContext, TransformContext } from '@use-gpu/workbench';
import { getBlockMinMax, getBlockMargin, fitBlock } from '../lib/block';
import { memoFit, memoLayout } from '../lib/util';
import { evaluateDimension } from '../parse';

import type { BoxTrait, ElementTrait } from '../types';
import { useBoxTrait, useElementTrait } from '../traits';
import { parseDimension, parseMargin } from '../parse';

export type EmbedProps = Partial<BoxTrait> &
{
  width?: Dimension,
  height?: Dimension,
  snap?: boolean,
  render?: (key: number, layout: Rectangle, clip?: ShaderModule, transform?: ShaderModule) => LiveElement<any>,
  children?: LiveElement<any>,
};

export const Embed: LiveComponent<EmbedProps> = memo((props: EmbedProps) => {
  const {
    snap = true,
    render,
    children,
  } = props;

  const { margin, grow, shrink, inline, flex } = useBoxTrait(props);

  const width  = useProp(props.width,  parseDimension);
  const height = useProp(props.height, parseDimension);

  const {id} = useFiber();

  const w = width != null && width === +width ? width : null;
  const h = height != null && height === +height ? height : null;

  const fixed = [w, h] as [number | null, number | null];

  const sizing = [w ?? 0, h ?? 0, w ?? 1e5, h ?? 1e5];

  let ratioX = undefined;
  let ratioY = undefined;
  if (typeof width  === 'string') ratioX = evaluateDimension(width,  1, false);
  if (typeof height === 'string') ratioY = evaluateDimension(height, 1, false);

  const fit = (into: FitInto) => {
      const w = width != null ? evaluateDimension(width, into[2], snap) : null;
      const h = height != null ? evaluateDimension(height, into[3], snap) : null;

      const size = [
        w ?? into[0],
        h ?? into[1],
      ] as [number, number];

      return {
        size,
        render: memoLayout((layout: Rectangle, clip?: ShaderModule, transform?: ShaderModule) => {
          const view = render
            ? render(id, layout, clip, transform)
            : (
              provide(LayoutContext, layout,
                provide(TransformContext, transform,
                  children
                ),
                id,
              )
            );
          return yeet(view);
        }),
      };
    };

  return yeet({
    size: [w, h],

    sizing,
    margin,
    grow,
    shrink,
    inline,
    flex,
    ratioX,
    ratioY,
    absolute: true,
    fit: memoFit(fit),
    prefit: memoFit(fit),
  });
}, 'Embed');
