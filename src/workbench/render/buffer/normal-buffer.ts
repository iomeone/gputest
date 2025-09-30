import type { LC } from '../../../live';
import type { OffscreenRenderContext } from '../../../core';
import type { OverscanOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '../../../live';
import { RenderTarget } from '../render-target';
import { useRenderContext } from '../../providers/render-provider';

export type NormalBufferProps = {
  facets?: boolean,
  resolution?: number,
  overscan?: OverscanOptions,
};

export const NORMAL_DEPTH_FORMAT = 'depth32float';
export const NORMAL_RENDER_FORMAT_THIN = 'rg8uint';
export const NORMAL_RENDER_FORMAT_FAT = 'rgba8uint';

export const NormalBuffer: LC = memo((props: NormalBufferProps) => {
  const {
    facets = false,
    resolution = 1,
    overscan: overscanProp,
  } = props;

  const overscan = overscanProp?.range || 0;

  // Normal render target
  const {samples} = useRenderContext();
  const depthStencil = NORMAL_DEPTH_FORMAT;
  const renderFormat = facets ? NORMAL_RENDER_FORMAT_FAT : NORMAL_RENDER_FORMAT_THIN;

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
  ];

  return gather(targets, (targets: OffscreenRenderContext[]) => {
    return yeet({
      buffers: { normal: targets },
    });
  });

}, 'NormalBuffer');
