import type { LC } from '@use-gpu/live';
import type { OffscreenRenderContext } from '@use-gpu/core';
import type { OverscanOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '@use-gpu/live';
import { RenderTarget } from '../render-target';

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
  const samples = 1;
  const depthStencil = NORMAL_DEPTH_FORMAT;
  const renderFormat = NORMAL_RENDER_FORMAT;

  const target = (
    use(RenderTarget, {
      label: 'NormalBuffer',
      resolution,
      overscan,
      samples,
      sampler: null,
      format: renderFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    })
  );

  return gather(target, (targets: OffscreenRenderContext[]) => {
    return yeet({
      buffers: { normal: targets },
    });
  });

}, 'NormalBuffer');
