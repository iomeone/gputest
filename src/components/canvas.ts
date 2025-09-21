import { LiveComponent, LiveElement } from '../live';
import { GPUPresentationContext, CanvasRenderingContextGPU } from '../webgpu/types';

import { useMemo, useOne, useResource } from '../live';

import { makePresentationContext } from '../webgpu';
import {
  makeColorState,
  makeColorAttachment,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
} from '@use-gpu/core';

export type CanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,

  render: (context: CanvasRenderingContextGPU) => LiveElement<any>,
}

export const PRESENTATION_FORMAT = "bgra8unorm" as GPUTextureFormat;
export const DEPTH_STENCIL_FORMAT = "depth24plus-stencil8" as GPUTextureFormat;
export const BACKGROUND_COLOR = [0.1, 0.2, 0.3, 1.0] as GPUColor;

export const Canvas: LiveComponent<CanvasProps> = (context) => (props) => {
  const {
    device,
    canvas,
    render,
    presentationFormat = PRESENTATION_FORMAT,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
  } = props;

  const {width, height} = canvas;

  const colorStates      = useOne(context, 0)(() => [makeColorState(presentationFormat)], presentationFormat);
  const colorAttachments = useOne(context, 1)(() => [makeColorAttachment(backgroundColor)], backgroundColor);

  const [
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  ] = useResource(context, 2)(() => {
      const texture = makeDepthTexture(device, width, height, depthStencilFormat);
      const state = makeDepthStencilState(depthStencilFormat);
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, state, attachment];
    },
    [device, width, height, depthStencilFormat]
  );

  const gpuContext = useMemo(context, 3)(() =>
    makePresentationContext(device, canvas, presentationFormat),
    [device, canvas, presentationFormat, width, height],
  );

  const deferred = render({
    width,
    height,
    gpuContext,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  } as CanvasRenderingContextGPU);

  return deferred;
}
