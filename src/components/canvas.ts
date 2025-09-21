import { LiveComponent, LiveElement } from '../live/types';
import { GPUPresentationContext, CanvasRenderingContextGPU } from '../webgpu/types';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, BACKGROUND_COLOR } from './constants';

import { RenderProvider } from './render-provider';
import { use, useMemo, useOne } from '../live';
import { makePresentationContext } from '../webgpu';
import {
  makeColorState,
  makeColorAttachment,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
} from '../core';

export type CanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,

  children: LiveElement<any>,
}

export const Canvas: LiveComponent<CanvasProps> = (fiber) => (props) => {
  const {
    device,
    canvas,
    children,
    presentationFormat = PRESENTATION_FORMAT,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
  } = props;

  const {width, height} = canvas;

  const colorStates      = useOne(() => [makeColorState(presentationFormat)], presentationFormat);
  const colorAttachments = useOne(() => [makeColorAttachment(null, backgroundColor)], backgroundColor);

  const [
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  ] = useMemo(() => {
      const texture = makeDepthTexture(device, width, height, depthStencilFormat);
      const state = makeDepthStencilState(depthStencilFormat);
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, state, attachment];
    },
    [device, width, height, depthStencilFormat]
  );

  const gpuContext = useMemo(() =>
    makePresentationContext(device, canvas, presentationFormat),
    [device, canvas, presentationFormat, width, height],
  );

  const renderContext = {
    width,
    height,
    device,
    gpuContext,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  } as CanvasRenderingContextGPU;

  return use(RenderProvider)({ renderContext, children });
}
