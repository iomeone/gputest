import type { LC } from '@use-gpu/live';
import type { OffscreenRenderContext } from '@use-gpu/core';
import type { OverscanOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '@use-gpu/live';
import { RenderTarget } from '../render-target';
import { useRenderContext } from '../../providers/render-provider';

export type NormalBufferProps = {
  resolution?: number,
  overscan?: OverscanOptions,
};

export const NORMAL_DEPTH_FORMAT = 'depth32float';
export const NORMAL_RENDER_FORMAT = 'rg8uint';

export const NormalBuffer: LC = memo((props: NormalBufferProps) => {
  const {
    resolution = 1,
    overscan: overscanProp,
  } = props;

  const overscan = overscanProp?.range || 0;

  // Normal render target
  const {samples} = useRenderContext();
  const depthStencil = NORMAL_DEPTH_FORMAT;
  const renderFormat = NORMAL_RENDER_FORMAT;

  const msaa = samples > 1;

  const targets = [
    use(RenderTarget, {
      label: 'NormalBuffer/Render',
      resolution,
      overscan,
      samples,
      unresolved: true,
      sampler: null,
      format: renderFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    }),
    msaa ? use(RenderTarget, {
      label: 'NormalBuffer/Resolve',
      resolution,
      overscan,
      samples: 1,
      sampler: null,
      format: renderFormat,
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
    }) : null,
  ];

  return gather(targets, (targets: OffscreenRenderContext[]) => {
    if (targets.length > 1) targets[1].depth = targets[0].depth;

    return yeet({
      buffers: { normal: targets },
    });
  });

}, 'NormalBuffer');
