import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext, TextureSource, ColorSpace } from '@use-gpu/core';

import { proxy } from '@use-gpu/core';
import { gather, use, useMemo, useOne } from '@use-gpu/live';
import { chainTo } from '@use-gpu/shader/wgsl';

import { Pass } from './pass';
import { RenderTarget } from './render-target';
import { RenderToTexture } from './render-to-texture';
import { RawFullScreen } from '../primitives/index';

import { getShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { gainColor } from '@use-gpu/wgsl/fragment/gain.wgsl';
import { tonemapACES } from '@use-gpu/wgsl/tonemap/aces.wgsl';
import { tonemapHable } from '@use-gpu/wgsl/tonemap/hable.wgsl';
import { tonemapUnreal } from '@use-gpu/wgsl/tonemap/unreal.wgsl';

export type LinearRGBProps = PropsWithChildren<{
  width?: number,
  height?: number,
  live?: boolean,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,

  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,

  colorInput?: ColorSpace,
  samples?: number,
  tonemap?: 'aces' | 'hable' | 'unreal' | 'linear',
  gain?: number,

  label?: string,
  overlay?: boolean,

  then?: (texture: TextureSource) => LiveElement,
}>;

/** Sets up a Linear RGB render target and automatically renders it to the screen as sRGB. */
export const LinearRGB: LiveComponent<LinearRGBProps> = (props: LinearRGBProps) => {
  const {
    tonemap = 'linear',
    gain = 1,
    overlay = false,
    then,
    children,
    ...rest
  } = props;

  return gather(
    use(RenderTarget, {
      label: 'LinearRGB',
      ...rest,
      format: "rgba16float",
      colorSpace: 'linear',
    }),
    ([target]: UseGPURenderContext[]) => {
      const g = useShaderRef(gain);
      const defs = useOne(() => ({IS_OPAQUE: !overlay}), overlay);

      const [filter, colorSpace] = useMemo(() => {
        let filter = getShader(gainColor, [g], defs);
        let colorSpace = 'linear';
        if (tonemap === 'aces') filter = chainTo(filter, tonemapACES);
        if (tonemap === 'hable') filter = chainTo(filter, tonemapHable);
        if (tonemap === 'unreal') {
          filter = chainTo(filter, tonemapUnreal);
          colorSpace = 'srgb';
        }
        return [filter, colorSpace];
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [defs, tonemap, g]);

      const view = useMemo(() => [
        use(RenderToTexture, {
          target,
          children,
        }),
        use(Pass, {
          mode: 'fullscreen',
          overlay,
          children:
            use(RawFullScreen, {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              texture: proxy(target.source!, {colorSpace}),
              filter,
            }),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ], [target, filter, children]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return then ? [view, then(target.source!)] : view;
    },
  );
};
