import { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { ColorSpace } from '@use-gpu/core/types';
import { use, provide, gather, useCallback, useContext, useFiber, useMemo, useOne } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
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

export type RenderToTextureProps = {
  width: number,
  height: number,
  live?: boolean,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,

  children?: LiveElement<any>,
  then?: (targetTexture: GPUTexture) => LiveElement<any>,
};

export const RenderToTexture: LiveComponent<RenderToTextureProps> = (props) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    width = renderContext.width,
    height = renderContext.height,
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = EMPTY_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    live,
    children,
    then,
  } = props;

  const [renderTexture, resolveTexture] = useMemo(() => [
      makeRenderableTexture(
        device,
        width,
        height,
        format,
        samples,
      ),
      samples > 1 ? makeRenderableTexture(
        device,
        width,
        height,
        format,
      ) : null,
    ] as [GPUTexture, GPUTexture | null],
    [device, width, height, format, samples]
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
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples]
  );
  
  const swapView = useCallback(() => {
  });

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
    sampler: {},
    layout: 'texture_2d<f32>',
    format,
    colorSpace,
    size: [width, height],
    version: 0,
  }), [targetTexture, width, height, format]);

  const Done = (ts: Task[]) => {
    usePerFrame();

    for (let task of ts) task();
    source.version++;
    
    if (!then) return null;    
    return provide(FrameContext, {current: source.version}, then(source));
  };

  return (
    gather(
      provide(RenderContext, rttContext, children)
    , Done)
  );
}
