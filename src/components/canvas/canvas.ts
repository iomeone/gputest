import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, BACKGROUND_COLOR } from '../constants';

import { EventProvider, RenderContext, DeviceContext } from '../providers';
import { provide, provideMemo, use, useMemo, useOne } from '@use-gpu/live';
import { makePresentationContext } from '@use-gpu/webgpu';
import {
  makeColorState,
  makeColorAttachment,
  makeRenderTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLIED,
} from '@use-gpu/core';

export type CanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  samples?: number,
  pixelRatio?: number,

  children?: LiveElement<any>,
}

const getPixelRatio = () => typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const Canvas: LiveComponent<CanvasProps> = (props) => {
  const {
    device,
    canvas,
    children,
    pixelRatio = getPixelRatio(),
    presentationFormat = PRESENTATION_FORMAT,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
    samples = 1
  } = props;

  const {width, height} = canvas;

  const renderTexture = useMemo(() =>
    samples
    ? makeRenderTexture(
        device,
        width,
        height,
        presentationFormat,
        samples,
      )
    : null,
    [device, width, height, presentationFormat, samples]
  );

  const colorStates      = useOne(() => [makeColorState(presentationFormat, BLEND_PREMULTIPLIED)], presentationFormat);
  const colorAttachments = useMemo(() =>
    [makeColorAttachment(renderTexture, null, backgroundColor)],
    [backgroundColor, renderTexture]
  );
  const depthStencilState = useOne(() => makeDepthStencilState(depthStencilFormat), depthStencilFormat);

  const [
    depthTexture,
    depthStencilAttachment,
  ] = useMemo(() => {
      const texture = makeDepthTexture(device, width, height, depthStencilFormat, samples);
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, attachment];
    },
    [device, width, height, depthStencilFormat, samples]
  );

  const gpuContext = useMemo(() =>
    makePresentationContext(device, canvas, presentationFormat),
    [device, canvas, presentationFormat, width, height],
  );

  const renderContext = {
    width,
    height,
    pixelRatio,
    samples,
    device,
    gpuContext,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  } as CanvasRenderingContextGPU;

  return provide(RenderContext, renderContext, provideMemo(DeviceContext, device, children));
}
