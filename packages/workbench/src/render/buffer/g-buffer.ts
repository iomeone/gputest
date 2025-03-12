import type { LC } from '@use-gpu/live';
import type { OffscreenRenderContext, TextureTarget } from '@use-gpu/core';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeColorAttachment, makeColorState, makeTargetTexture,
} from '@use-gpu/core';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';
import { useInspectable } from '../../hooks/useInspectable';

const LABELS = ['GBuffer/Albedo', 'GBuffer/Normal', 'GBuffer/Material', 'GBuffer/Emissive', 'GBuffer/Depth'];

export const GBuffer: LC = memo(() => {
  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const inspect = useInspectable();

  const {width, height, samples} = renderContext;
  if (samples > 1) throw new Error("GBuffer cannot be multisampled");

  const {depthStencilState, viewAttachments} = renderContext;
  if (!depthStencilState) throw new Error("GBuffer render target must have depth");

  const {format} = depthStencilState;
  const hasFloat = device.features.has('rg11b10ufloat-renderable');

  // Set up GBuffer layout
  const formats = useMemo(() => [
    'rgba8unorm',  // RGB + Occlusion
    'rgba16float', // Normal (RG) + Bent Normal (RG)
    'rgba8unorm',  // Material (RGBA) = (metalness, roughness, _, _)
    hasFloat       // Emissive (RGB)
      ? 'rg11b10ufloat'
      : 'rgb10a2unorm',
    format,        // Resolve
  ] as GPUTextureFormat[], [hasFloat, format]);

  const renderTextures = useMemo(() => formats.map((format, i) => makeTargetTexture(
    device,
    width,
    height,
    1,
    format,
    1,
    1,
    LABELS[i],
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
      hint: i === 4 ? 'depth' : undefined,
    }) as TextureTarget;

    return renderTextures.map(makeSource);
  }, [renderTextures, formats, width, height]);

  const gBufferContext: OffscreenRenderContext = useMemo(() => ({
    ...renderContext,
    colorStates,
    viewAttachments: [{
      ...viewAttachments[0],
      colorAttachments,
    }],
    sources,
  }), [renderContext, colorStates, viewAttachments, colorAttachments, sources]);

  inspect({
    output: {
      color: sources,
    },
  });

  return yeet({
    buffers: { gBuffer: [gBufferContext] },
  });
}, 'GBuffer');
