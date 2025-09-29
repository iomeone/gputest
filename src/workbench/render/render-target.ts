import type { LiveFiber, LiveComponent, LiveElement, ArrowFunction, PropsWithChildren } from '@use-gpu/live';
import type { OffscreenTarget, ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { use, provide, gather, fence, yeet, useCallback, useContext, useFiber, useMemo, useOne, incrementVersion } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';

import { useInspectable } from '../hooks/useInspectable';

import {
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLY,
} from '@use-gpu/core';

const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderTargetProps = {
  width?: number,
  height?: number,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,
  resolution?: number,

  render?: (rttContext: OffscreenTarget) => LiveElement,
  then?: (target: TextureTarget) => LiveElement,
};

/** Off-screen render target.

Place `@{<Pass>}` directly inside, or leave empty to use yielded target with `@{<RenderToTexture>}`.
*/
export const RenderTarget: LiveComponent<RenderTargetProps> = (props: PropsWithChildren<RenderTargetProps>) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const inspect = useInspectable();

  const {
    resolution = 1,
    width = Math.floor(renderContext.width * resolution),
    height = Math.floor(renderContext.height * resolution),
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    history = 0,
    sampler = NO_SAMPLER,
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = EMPTY_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    render,
    children,
    then,
  } = props;

  const [renderTexture, resolveTexture, bufferTextures, bufferViews, counter] = useMemo(
    () => {
      const render =
        makeTargetTexture(
          device,
          width,
          height,
          format,
          samples,
        );

      const resolve = samples > 1 ?
        makeTargetTexture(
          device,
          width,
          height,
          format,
        ) : null;

      const buffers = history > 0 ? seq(history).map(() =>
        makeTargetTexture(
          device,
          width,
          height,
          format,
        )
      ) : null;
      if (buffers) buffers.push(resolve ?? render);      

      const views = buffers ? buffers.map(b => b.createView()) : undefined;

      const counter = { current: 0 };

      return [render, resolve, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );
  
  const targetTexture = resolveTexture ?? renderTexture;

  const colorStates      = useOne(() => [makeColorState(format, BLEND_PREMULTIPLY)], format);
  const colorAttachments = useMemo(() =>
    [makeColorAttachment(renderTexture, resolveTexture, backgroundColor)],
    [renderTexture, resolveTexture, backgroundColor]
  );
  const depthStencilState = useOne(() => depthStencil
    ? makeDepthStencilState(depthStencil)
    : undefined,
    depthStencil);

  const [
    depthTexture,
    depthStencilAttachment,
  ] = useMemo(() => {
      if (!depthStencil) return [];

      const texture = makeDepthTexture(device, width, height, depthStencil, samples);
      const attachment = makeDepthStencilAttachment(texture, depthStencil);
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples]
  );

  const [source, sources, depth] = useMemo(() => {
    const view = targetTexture.createView();
    const size = [width, height] as [number, number];
    const volatile = history ? history + 1 : 0;
    const layout = 'texture_2d<f32>';

    const swap = () => {
      if (!history) return;
      const {current: index} = counter;
      const n = bufferViews!.length;

      const texture = bufferTextures![index];
      const view = bufferViews![index];

      if (resolveTexture) colorAttachments[0].resolveTarget = view;
      else colorAttachments[0].view = view;

      source.texture = texture;
      source.view = view;

      for (let i = 0; i < history; i++) {
        const j = (index + n - i - 1) % n;
        sources![i].texture = bufferTextures![j];
        sources![i].view = bufferViews![j];
      }

      counter.current = (index + 1) % n;
    };
    
    const makeSource = () => ({
      texture: targetTexture,
      view,
      sampler,
      layout,
      format,
      colorSpace,
      size,
      volatile,
      version: 0,
    }) as TextureTarget;

    const sources = history ? seq(history).map(makeSource) : undefined;

    const source = makeSource();
    source.history = sources;
    source.swap = swap;

    const depth = depthStencil ? {
      texture: depthTexture,
      sampler: {},
      layout: samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d',
      format: depthStencil,
      size,
      version: 0,
    } as TextureSource : null;

    return [source, sources, depth];
  }, [targetTexture, depthTexture, width, height, format, samples, history, sampler, depthStencil]);

  const rttContext = useMemo(() => ({
    ...renderContext,
    width,
    height,
    samples,
    colorSpace,
    colorInput,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
    swap: source.swap,
    source: source,
  }), [renderContext, width, height, colorStates, colorAttachments, depthStencilState, depthStencilAttachment, source, sources]);

  const inspectable = useMemo(() => [
    source,
    ...(sources ?? []),
    ...(depth ? [depth] : []),
  ], [source, sources, depth]);

  inspect({
    output: {
      color: inspectable,
    },
  });

  if (!(render ?? children)) return yeet(rttContext);

  const content = render ? render(rttContext) : children;
  const view = provide(RenderContext, rttContext, content);

  if (then) return fence(view, () => then(source));
  return view;
}
