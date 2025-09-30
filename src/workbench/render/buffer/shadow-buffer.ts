import type { LC, PropsWithChildren } from '../../../live';

import { yeet, memo } from '../../../live';
import { makeDepthStencilState } from '../../../core';

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

  const context = {
    ...renderContext,
    pixelRatio: 1,
    samples: 1,
    colorSpace: 'native',
    colorInput: 'native',
    colorStates: [],
    colorAttachments: [],
    depthStencilState: makeDepthStencilState(format),
    swap: () => {},
  };

  return yeet({ shadow: context });
}, 'ShadowBuffer');
