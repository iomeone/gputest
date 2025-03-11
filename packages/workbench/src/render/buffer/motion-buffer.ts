import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';

import { use, gather, yeet, memo } from '@use-gpu/live';

import { useUniformSource } from '../../hooks/useUniformSource';

import { useRenderContext } from '../../providers/render-provider';

import { RenderTarget } from '../render-target';

export type MotionBufferProps = {
  resolution?: number,
  overscan?: number,
};

export const MOTION_DEPTH_FORMAT = 'depth32float';
export const MOTION_RENDER_FORMAT = 'rg16float';

export const MotionBuffer: LC = memo((props: MotionBufferProps) => {
  const {
    resolution = 1,
    overscan = 0,
  } = props;

  const renderContext = useRenderContext();

  // Motion render target
  const samples = 1;
  const depthStencil = MOTION_DEPTH_FORMAT;
  const renderFormat = MOTION_RENDER_FORMAT;

  const target = (
    use(RenderTarget, {
      label: 'MotionBuffer',
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

  return gather(target, ([motionContext]: TextureTarget[]) => {
    return yeet({
      buffers: { motion: [motionContext] },
    });
  });

}, 'MotionBuffer');
