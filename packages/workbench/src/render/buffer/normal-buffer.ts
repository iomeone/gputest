import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';

import { use, gather, yeet, memo } from '@use-gpu/live';
import { RenderTarget } from '../render-target';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';

export type NormalBufferProps = {
  resolution?: number,
};

export const NORMAL_DEPTH_FORMAT = 'depth32float';
export const NORMAL_RENDER_FORMAT = 'rg8uint';

export const NormalBuffer: LC = memo((props: NormalBufferProps) => {
  const {
    resolution = 1,
  } = props;

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const samples = 1;
  const depthStencil = NORMAL_DEPTH_FORMAT;
  const renderFormat = NORMAL_RENDER_FORMAT;

  const target = (
    use(RenderTarget, {
      label: 'NormalBuffer',
      resolution,
      samples,
      sampler: null,
      format: renderFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    })
  );

  return gather(target, ([normalContext]: TextureTarget[]) => {
    return yeet({
      buffers: { normal: [normalContext] },
    });
  });

}, 'NormalBuffer');
