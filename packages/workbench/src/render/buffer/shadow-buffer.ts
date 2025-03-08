import type { LC, PropsWithChildren } from '@use-gpu/live';

import { yeet, memo } from '@use-gpu/live';
import { makeDepthStencilState } from '@use-gpu/core';

import { useRenderContext } from '../../providers/render-provider';

import { SHADOW_FORMAT } from '../light/light-data';

export type ShadowBufferProps = PropsWithChildren<{
  format?: GPUTextureFormat,
}>;

// Provide render context for depth-only shadow passes
export const ShadowBuffer: LC<ShadowBufferProps> = memo((props: ShadowBufferProps) => {
  const {
    format = SHADOW_FORMAT,
  } = props;

  const renderContext = useRenderContext();

  // Placeholder render context, used for depth-only render pass and depth-copies
  const context = {
    device: renderContext.device,
    gpuContext: renderContext.gpuContext,

    // Sized dynamically in shadow atlas
    width: 0,
    height: 0,

    pixelRatio: 1,
    samples: 1,
    colorSpace: 'native',
    colorInput: 'native',
    colorStates: [],
    depthStencilState: makeDepthStencilState(format),
    viewType: '2d',
    viewAttachments: [],
  };

  return yeet({ shadow: context });
}, 'ShadowBuffer');
