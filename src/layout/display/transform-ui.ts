import type { LiveComponent, LiveElement, PropsWithChildren } from '../../live';
import type { ShaderModule } from '../../shader';
import type { Rectangle } from '../../core';
import type { LayoutRenderer, LayoutElement, FitInto } from '../types';

import { use, memo, gather, yeet, useMemo } from '../../live';
import { bindBundle, chainTo } from '../../shader/wgsl';

import { memoFit } from '../lib/util';

import { getCombinedClip, getTransformedClip } from '../../wgsl/layout/clipwgsl';

export type TransformUIProps = PropsWithChildren<{
  clip?: ShaderModule,
  mask?: ShaderModule,
  transform?: ShaderModule,
  inverse?: ShaderModule,
}>;

export const TransformUI: LiveComponent<TransformUIProps> = memo((props: TransformUIProps) => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
