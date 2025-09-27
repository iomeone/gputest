import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { ColorSpace } from '@use-gpu/core/types';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, BACKGROUND_COLOR } from '../constants';

import { EventProvider, RenderContext, DeviceContext } from '../providers';
import { provide, use, imperative, useCallback, useMemo, useOne } from '@use-gpu/live';
import { makePresentationContext } from '@use-gpu/webgpu';
import {
  makeColorState,
  makeColorAttachment,
  makeRenderTexture,
  makeReadbackTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLIED,
} from '@use-gpu/core';

export type CanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,
  pixelRatio?: number,

  children?: LiveElement<any>,
}

const getPixelRatio = () => typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const Canvas: LiveComponent<CanvasProps> = imperative((props) => {
  const {
    device,
    canvas,
    children,
    pixelRatio = getPixelRatio(),
    format = PRESENTATION_FORMAT,
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    samples = 1
  } = props;

  const {width, height} = canvas;

  const renderTexture = useMemo(() =>
    samples > 1
    ? makeRenderTexture(
        device,
        width,
        height,
        format,
        samples,
      )
    : null,
    [device, width, height, format, samples]
  );
  
  const colorStates      = useOne(() => [makeColorState(format, BLEND_PREMULTIPLIED)], format);
  const colorAttachments = useMemo(() =>
    [makeColorAttachment(renderTexture, null, backgroundColor)],
    [backgroundColor, renderTexture]
  );
  const depthStencilState = useOne(() => makeDepthStencilState(depthStencil), depthStencil);

  const [
    depthTexture,
    depthStencilAttachment,
  ] = useMemo(() => {
      const texture = makeDepthTexture(device, width, height, depthStencil, samples);
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples]
  );

  const gpuContext = useMemo(() =>
    makePresentationContext(device, canvas, format),
    [device, canvas, format, width, height],
  );
  
  const swapView = useCallback((view?: GPUTextureView) => {
    view = view ?? gpuContext
      .getCurrentTexture()
      .createView();

    if (samples > 1) colorAttachments[0].resolveTarget = view; 
    else colorAttachments[0].view = view;
  }, [gpuContext, samples, colorAttachments])

  const renderContext = {
    width,
    height,
    pixelRatio,
    samples,
    gpuContext,
    colorSpace,
    colorInput,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,

    swapView,
  } as CanvasRenderingContextGPU;

  return (
    provide(RenderContext, renderContext,
      provide(DeviceContext, device,
        children
      )
    )
  );
}, 'Canvas')
