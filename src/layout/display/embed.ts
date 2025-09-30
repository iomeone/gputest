import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { FitInto, Dimension } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { useProp } from '@use-gpu/traits/live';
import { memo, provide, yeet, useFiber } from '@use-gpu/live';
import { LayoutContext, TransformContext, LayerReconciler } from '@use-gpu/workbench';
import { memoFit, memoLayout } from '../lib/util';
import { evaluateDimension } from '../parse';

import { BoxTrait, useBoxTrait } from '../traits';
import { parseDimension } from '../parse';

const {quote} = LayerReconciler;

export type EmbedProps =
  TraitProps<typeof BoxTrait> &
PropsWithChildren<{
  width?: Dimension,
  height?: Dimension,
  snap?: boolean,
  render?: (
    key: number,
    layout: Rectangle,
    origin: Rectangle,
    z: number,
    clip: ShaderModule | null,
    mask: ShaderModule | null,
    transform: ShaderModule | null,
  ) => LiveElement,
}>;

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
      render: memoLayout((
        layout: Rectangle,
        origin: Rectangle,
        z: number,
        clip: ShaderModule | null,
        mask: ShaderModule | null,
        transform: ShaderModule | null,
      ) => {
        const view = render
          ? render(id, layout, origin, z, clip, mask, transform)
          : (
            provide(LayoutContext, layout,
              provide(TransformContext, {transform}, children),
              id,
            )
          );
        return quote(view);
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
