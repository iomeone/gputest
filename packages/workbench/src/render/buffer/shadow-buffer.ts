import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { OffscreenRenderContext } from '@use-gpu/core';

import { yeet, memo } from '@use-gpu/live';
import { makeDepthStencilState } from '@use-gpu/core';

import { useRenderContext } from '../../providers/render-provider';

import { SHADOW_FORMAT } from '../light/light-data';

import shadowBindingWGSL from '@use-gpu/wgsl/use/shadow.wgsl';

export type ShadowBufferProps = PropsWithChildren<{
  format?: GPUTextureFormat,
}>;

const NO_OBJECT = {} as Record<string, any>;

// Provide render context for depth-only shadow passes
export const ShadowBuffer: LC<ShadowBufferProps> = memo((props: ShadowBufferProps) => {
  const {
    format = SHADOW_FORMAT,
  } = props;

  const renderContext = useRenderContext();

  // Placeholder render context, used for depth-only render pass and depth-copies
  const shadowContext: OffscreenRenderContext = {
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

  const shadowBinding = {
    module: shadowBindingWGSL,
    visibility: 'fragment',
    bind: ({light}: PassEnv) => {
      const {shadowMap} = light?.sources ?? NO_OBJECT;

      return [
        shadowMap && {...shadowMap, sampler: null},
        shadowMap && {sampler: shadowMap.sampler, filter: shadowMap.filter},
      ];
    },
  };

  return yeet({
    buffers: { shadow: [shadowContext] },
    bindings: { shadow: shadowBinding },
  });
}, 'ShadowBuffer');
