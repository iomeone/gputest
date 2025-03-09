import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';

import { use, gather, yeet, memo } from '@use-gpu/live';
import { RenderTarget } from '../render-target';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';

export type MotionBufferProps = {
  resolution?: number,
};

export const MOTION_DEPTH_FORMAT = 'depth32float';
export const MOTION_RENDER_FORMAT = 'rg16float';

export const MotionBuffer: LC = memo((props: MotionBufferProps) => {
  const {
    resolution = 1,
  } = props;

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const samples = 1;
  const depthStencil = MOTION_DEPTH_FORMAT;
  const renderFormat = MOTION_RENDER_FORMAT;

  const target = (
    use(RenderTarget, {
      label: 'MotionBuffer',
      resolution,
      samples,
      sampler: null,
      format: renderFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    })
  );

  return gather(target, ([target]: TextureTarget[]) => {
    return yeet({
      motion: [target],
    });
  });

}, 'MotionBuffer');
