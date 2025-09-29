import type { LC, PropsWithChildren } from '@use-gpu/live';

import { makeDepthStencilState } from '@use-gpu/core';
import { yeet, memo } from '@use-gpu/live';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';

import { SHADOW_FORMAT } from '../light/light-data';

export type ShadowBufferProps = {
  format?: GPUTextureFormat,
};

// Provide render context for depth-only shadow passes
export const ShadowBuffer: LC<ShadowBufferProps> = memo((props: PropsWithChildren<ShadowBufferProps>) => {
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
    depthStencilState: makeDepthStencilState(SHADOW_FORMAT),
  };

  return yeet({ shadow: context });
}, 'ShadowBuffer');
