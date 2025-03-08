import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';

import { use, gather, yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { makeColorAttachment, makeColorState, makeDepthStencilState, makeDepthTexture, makeDepthStencilAttachment, makeTargetTexture } from '@use-gpu/core';

import { RenderTarget } from '../render-target';
import { TextureBuffer } from '../../compute/texture-buffer';

import { useDeviceContext } from '../../providers/device-provider';
import { useInspectable } from '../../hooks/useInspectable';

export type SSAOBufferProps = {
  resolution?: number,
};

export const SSAO_DEPTH_FORMAT = 'depth32float';
export const SSAO_NORMAL_FORMAT = 'rg8uint';
export const SSAO_MOTION_FORMAT = 'rg16float';
export const SSAO_SAMPLE_FORMAT = 'rgba8unorm';
export const SSAO_ACCUM_FORMAT = 'rgba16float';
export const SSAO_RESOLVE_FORMAT = 'rgba8unorm';

export const SSAOBuffer: LC = memo((props: SSAOBufferProps) => {
  const device = useDeviceContext();
  const inspect = useInspectable();

  const resolution = 1/2;
  const samples = 1;

  const depthStencil  = SSAO_DEPTH_FORMAT;
  const normalFormat  = SSAO_NORMAL_FORMAT;
  const motionFormat  = SSAO_MOTION_FORMAT;
  const sampleFormat  = SSAO_SAMPLE_FORMAT;
  const accumFormat   = SSAO_ACCUM_FORMAT;
  const resolveFormat = SSAO_RESOLVE_FORMAT;

  const targets = [
    use(RenderTarget, {
      label: 'SSAO/NormalDepth',
      resolution,
      samples,
      sampler: null,
      format: normalFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/Motion',
      resolution,
      samples,
      sampler: null,
      format: motionFormat,
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/Sample',
      resolution,
      samples,
      sampler: null,
      format: sampleFormat,
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/Accum',
      resolution,
      samples,
      sampler: { minFilter: 'linear', magFilter: 'linear' },
      history: 1,
      format: accumFormat,
      depthStencil: null,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/Resolve',
      resolution: 1,
      samples,
      sampler: null,
      format: resolveFormat,
      depthStencil: null,
      colorSpace: 'linear',
    }),
  ];
  
  return gather(targets, (targets: TextureTarget[]) => {
    const [
      normalTarget,
      motionTarget,
      sampleTarget,
      accumTarget,
      resolveTarget,
    ] = targets;

    const sources = useOne(() => [
      normalTarget.depth,
      normalTarget.source,
      motionTarget.source,
      sampleTarget.source,
      accumTarget.source,
      resolveTarget.source,
    ], targets);

    inspect({
      output: {
        color: sources,
      },
    });

    return yeet({ ssao: [normalTarget, motionTarget, sampleTarget, accumTarget, resolveTarget] });
  });

}, 'SSAOBuffer');
