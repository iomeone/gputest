import type { LC } from '@use-gpu/live';
import type { OffscreenRenderContext } from '@use-gpu/core';
import type { PassBinding } from '../../pass/types';

import { use, gather, yeet, memo } from '@use-gpu/live';

import { RenderTarget } from '../render-target';

import ssaoBindingWGSL from '@use-gpu/wgsl/use/ssao.wgsl';

export type SSAOBufferProps = {
  overscan?: number,
};

export const SSAO_DEPTH_FORMAT = 'depth32float';
export const SSAO_NORMAL_FORMAT = 'rg8uint';
export const SSAO_MOTION_FORMATS = ['rg16float', 'r16float'];
export const SSAO_SAMPLE_FORMAT = 'rgba8unorm';
export const SSAO_ACCUM_FORMAT = 'rgba16float';
export const SSAO_RESOLVE_FORMAT = 'rgba8unorm';

export const SSAOBuffer: LC = memo((props: SSAOBufferProps) => {
  const {overscan} = props;
  const resolution = 1/2;
  const samples = 1;

  const depthStencil  = SSAO_DEPTH_FORMAT;
  const normalFormat  = SSAO_NORMAL_FORMAT;
  const motionFormats = SSAO_MOTION_FORMATS;
  const sampleFormat  = SSAO_SAMPLE_FORMAT;
  const accumFormat   = SSAO_ACCUM_FORMAT;
  const resolveFormat = SSAO_RESOLVE_FORMAT;

  const targets = [
    use(RenderTarget, {
      label: 'SSAO/NormalDepth',
      resolution,
      overscan,
      history: 1,
      depthHistory: true,
      samples,
      sampler: null,
      format: normalFormat,
      variant: 'textureLoad',
      depthStencil,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/MotionXY',
      resolution,
      overscan,
      samples,
      sampler: null,
      format: motionFormats[0],
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
      hint: 'motion/xy',
    }),
    use(RenderTarget, {
      label: 'SSAO/MotionZ',
      resolution,
      overscan,
      samples,
      sampler: null,
      format: motionFormats[1],
      variant: 'textureLoad',
      depthStencil: null,
      colorSpace: 'linear',
      hint: 'motion/z',
    }),
    use(RenderTarget, {
      label: 'SSAO/Sample',
      resolution,
      overscan,
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
      overscan,
      samples,
      sampler: { minFilter: 'linear', magFilter: 'linear' },
      history: 1,
      format: accumFormat,
      depthStencil: null,
      colorSpace: 'linear',
    }),
    use(RenderTarget, {
      label: 'SSAO/Resolve',
      samples,
      sampler: null,
      format: resolveFormat,
      depthStencil: null,
      colorSpace: 'linear',
    }),
  ];
  
  return gather(targets, (targets: OffscreenRenderContext[]) => {
    const [,,,,, resolveTarget] = targets;

    const ssaoBinding: PassBinding = {
      module: ssaoBindingWGSL,
      visibility: 'fragment',
      bind: () => [resolveTarget.source],
    };

    return yeet({
      buffers: { ssao: targets },
      bindings: { ssao: ssaoBinding },
    });
  });
}, 'SSAOBuffer');
