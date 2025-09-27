import type { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live';
import type { ColorSpace, TextureSource } from '@use-gpu/core';

import { use, provide, gather, useCallback, useContext, useFiber, useMemo, useOne, incrementVersion } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { FeedbackContext } from '../providers/feedback-provider';
import { FrameContext, usePerFrame, useNoPerFrame } from '../providers/frame-provider';

import {
  makeColorState,
  makeColorAttachment,
  makeRenderableTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  makeTextureView,
  BLEND_PREMULTIPLIED,
} from '@use-gpu/core';

const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderToTextureProps = {
  width?: number,
  height?: number,
  live?: boolean,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,

  children?: LiveElement<any>,
  then?: (texture: TextureSource) => LiveElement<any>,
};

export const RenderToTexture: LiveComponent<RenderToTextureProps> = (props) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    width = renderContext.width,
    height = renderContext.height,
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    history = 0,
    sampler = NO_SAMPLER,
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = EMPTY_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    live,
    children,
    then,
  } = props;

  const [renderTexture, resolveTexture, bufferTextures, bufferViews, counter] = useMemo(
    () => {
      const render =
        makeRenderableTexture(
          device,
          width,
          height,
          format,
          samples,
        );

      const resolve = samples > 1 ?
        makeRenderableTexture(
          device,
          width,
          height,
          format,
        ) : null;

      const buffers = history > 0 ? seq(history).map(() =>
        makeRenderableTexture(
          device,
          width,
          height,
          format,
        )
      ) : null;
      if (buffers) buffers.push(resolve ?? render);      

      const views = buffers ? buffers.map(b => makeTextureView(b)) : null;

      const counter = { current: 0 };

      return [render, resolve, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );
  
  if (live) usePerFrame();
  else useNoPerFrame();

  const targetTexture = resolveTexture ?? renderTexture;

  const colorStates      = useOne(() => [makeColorState(format, BLEND_PREMULTIPLIED)], format);
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
  
  const swapView = useCallback(() => {
    if (!history) return;

    const texture = bufferTextures![counter.current];
    const view = bufferViews![counter.current];
    counter.current = (counter.current + 1) % bufferViews!.length;

    if (resolveTexture) colorAttachments[0].resolveTarget = view;
    else colorAttachments[0].view = view;

    feedback!.texture = source.texture;
    feedback!.view = source.view;

    source.texture = texture;
    source.view = view;
  }, [bufferViews]);

  const rttContext = useMemo(() => ({
    ...renderContext,
    width,
    height,
    colorSpace,
    colorInput,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
    swapView,
  }), [renderContext, width, height, colorStates, colorAttachments, depthTexture, depthStencilState, depthStencilAttachment]);

  const source = useMemo(() => ({
    texture: targetTexture,
    view: makeTextureView(targetTexture),
    sampler,
    layout: 'texture_2d<f32>',
    format,
    colorSpace,
    size: [width, height] as [number, number],
    volatile: history,
    version: 0,
  }), [targetTexture, width, height, format, history, sampler]);

  const feedback = useMemo(() => history ? {
    texture: targetTexture,
    view: makeTextureView(targetTexture),
    sampler,
    layout: 'texture_2d<f32>',
    format,
    colorSpace,
    size: [width, height] as [number, number],
    volatile: history,
    version: 0,
  } : null, [targetTexture, width, height, format, history, sampler]);

  const Done = (ts: Task[]) => {
    usePerFrame();

    for (let task of ts) task();
    source.version = incrementVersion(source.version);
    
    if (!then) return null;    
    return provide(FrameContext, {current: source.version}, then(source));
  };

  const view = history ? provide(FeedbackContext, feedback, children) : children;

  return (
    gather(
      provide(RenderContext, rttContext, view)
    , Done)
  );
}
