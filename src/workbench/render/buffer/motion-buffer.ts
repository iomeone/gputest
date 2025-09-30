import type { LC } from '../../../live';
import type { OffscreenRenderContext } from '../../../core';
import type { OverscanOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '../../../live';
import { RenderTarget, useCombinedRenderTarget } from '../render-target';

export type MotionBufferProps = {
  resolution?: number,
  overscan?: OverscanOptions,
};

export const MOTION_DEPTH_FORMAT = 'depth32float';
export const MOTION_RENDER_FORMATS = ['rg16float', 'r16float'];

export const MotionBuffer: LC = memo((props: MotionBufferProps) => {
  const {
    resolution = 1,
    overscan: overscanProp,
  } = props;

  const overscan = overscanProp?.range || 0;

  // Motion render target
  const samples = 1;
  const depthStencil = MOTION_DEPTH_FORMAT;
  const renderFormats = MOTION_RENDER_FORMATS;

  const targets = [
    use(RenderTarget, {
      label: 'MotionBuffer/XY',
      resolution,
      overscan,
      samples,
      sampler: null,
      blend: 'none',
      format: renderFormats[0],
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
      hint: 'motion/xy',
    }),
    use(RenderTarget, {
      label: 'MotionBuffer/Z',
      resolution,
      overscan,
      samples,
      sampler: null,
      blend: 'none',
      format: renderFormats[1],
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
      hint: 'motion/z',
    }),
  ];

  return gather(targets, (targets: OffscreenRenderContext[]) => {
    const motionContext = useCombinedRenderTarget(targets);
    return yeet({
      buffers: { motion: [motionContext] },
    });
  });
}, 'MotionBuffer');
