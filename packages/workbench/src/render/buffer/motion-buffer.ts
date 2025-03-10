import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';
import type { PassBinding } from '../../pass/types';

import { use, gather, yeet, memo } from '@use-gpu/live';
import { RenderTarget } from '../render-target';

import { useUniformSource } from '../../hooks/useUniformSource';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';

import motionBindingWGSL, { MotionUniforms as MotionUniformsWGSL } from '@use-gpu/wgsl/use/motion.wgsl';

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

  const device = useDeviceContext();
  const renderContext = useRenderContext();

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

  const [source, update] = useUniformSource(MotionUniformsWGSL);
  const motionBinding = {
    module: motionBindingWGSL,
    bind: () => [source],
    update,
  };

  return gather(target, ([motionContext]: TextureTarget[]) => {
    return yeet({
      buffers: { motion: [motionContext] },
      bindings: { motion: motionBinding },
    });
  });

}, 'MotionBuffer');
