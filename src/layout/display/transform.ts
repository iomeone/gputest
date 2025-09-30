import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Rectangle } from '@use-gpu/core';
import type { LayoutRenderer, LayoutElement, FitInto } from '../types';

import { use, memo, gather, yeet, useMemo } from '@use-gpu/live';
import { bindBundle, chainTo } from '@use-gpu/shader/wgsl';

import { memoFit } from '../lib/util';

import { getCombinedClip, getTransformedClip } from '@use-gpu/wgsl/layout/clip.wgsl';

export type TransformProps = PropsWithChildren<{
  clip?: ShaderModule,
  mask?: ShaderModule,
  transform?: ShaderModule,
  inverse?: ShaderModule,
}>;

export const Transform: LiveComponent<TransformProps> = memo((props: TransformProps) => {
  const {
    clip,
    mask,
    transform,
    inverse,
    children,
  } = props;

  return gather(children, (items: LayoutElement[]) => {
    return useMemo(() => yeet(items.map(item => {
      const fit = (
        into: FitInto
      ) => {
        const fit = item.fit(into);
        return {
          ...fit,
          render: (
            box: Rectangle,
            origin: Rectangle,
            z: number,
            parentClip: ShaderModule | null,
            parentMask: ShaderModule | null,
            parentTransform: ShaderModule | null,
          ) => (
            use(TransformLayout,
              box,
              origin,
              z,
              parentClip,
              parentMask,
              parentTransform,
              clip,
              mask,
              transform,
              inverse,
              fit.render,
            )
          ),
        };
      };

      return {
        ...item,
        fit: memoFit(fit),
        prefit: memoFit(fit),
      };
    })), [items, mask, transform]);
  });
}, 'Transform');

const TransformLayout = (
  box: Rectangle,
  origin: Rectangle,
  z: number,
  parentClip: ShaderModule | null,
  parentMask: ShaderModule | null,
  parentTransform: ShaderModule | null,
  clip: ShaderModule | null,
  mask: ShaderModule | null,
  transform: ShaderModule | null,
  inverse: ShaderModule | null,
  render: LayoutRenderer
): LiveElement => {

  const xmask = useMemo(
    () => (parentMask && mask ? chainTo(parentMask, mask) : parentMask ?? mask) ?? null,
    [parentMask, mask],
  );
  const xform = useMemo(
    () => (parentTransform && transform ? chainTo(parentTransform, transform) : parentTransform ?? transform) ?? null,
    [parentTransform, transform],
  );

  const pclip = useMemo(
    () => (parentClip && clip) ? (
      bindBundle(
        getCombinedClip,
        {
          getParent: parentClip,
          getSelf: clip ?? null,
        }
      )
    ) : (parentClip ?? clip) ?? null,
    [parentClip, clip],
  );

  const xclip = useMemo(
    () => inverse ? (
      bindBundle(
        getTransformedClip,
        {
          getParent: pclip,
          applyTransform: inverse,
        }
      )
    ) : pclip,
    [pclip, inverse],
  );

  return render(box, box, z, xclip, xmask, xform);
};
