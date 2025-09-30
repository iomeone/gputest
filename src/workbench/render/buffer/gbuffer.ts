import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeColorAttachment, makeColorState, makeTargetTexture,
} from '@use-gpu/core';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';
import { useInspectable } from '../../hooks/useInspectable';

export const GBuffer: LC = memo(() => {
  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const inspect = useInspectable();

  const {width, height, samples} = renderContext;
  if (samples > 1) throw new Error("GBuffer cannot be multisampled");

  const {depthStencilState} = renderContext;
  if (!depthStencilState) throw new Error("GBuffer render target must have depth");

  const {format} = depthStencilState;
  const hasFloat = device.features.has('rg11b10ufloat-renderable');

  // Set up GBuffer layout
  const formats = useMemo(() => [
    'rgba8unorm',
    'rgba16float',
    'rgba8unorm',
    hasFloat ? 'rg11b10ufloat' : 'rgb10a2unorm',
    format,
  ] as GPUTextureFormat[], [hasFloat, format]);

  const renderTextures = useMemo(() => formats.map(format => makeTargetTexture(
    device,
    width,
    height,
    format,
    1,
  )), [device, width, height, formats]);

  const colorStates = useOne(() => formats.slice(0, 4).map(format => makeColorState(format)), formats);
  const colorAttachments = useOne(() => renderTextures.slice(0, 4).map(texture => makeColorAttachment(texture, null)), renderTextures);

  const sources = useMemo(() => {
    const makeSource = (texture: GPUTexture, i: number) => ({
      texture,
      sampler: {},
      layout: i === 4 ? 'texture_depth_2d' : 'texture_2d<f32>',
      aspect: i === 4 ? 'depth-only' : 'all',
      format: formats[i],
      colorSpace: 'linear',
      size: [width, height],
      version: 0,
    }) as TextureTarget;

    return renderTextures.map(makeSource);
  }, [renderTextures, formats, width, height]);

  const context = useMemo(() => ({
    ...renderContext,
    colorStates,
    colorAttachments,
    sources,
  }), [renderContext, colorStates, colorAttachments, sources]);

  inspect({
    output: {
      color: sources,
    },
  });

  return yeet({ gbuffer: context });
}, 'GBuffer');
