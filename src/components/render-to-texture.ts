import { LiveFiber, LiveComponent, LiveElement, Task } from '../live/types';
import { GPUPresentationContext, CanvasRenderingContextGPU } from '../webgpu/types';
import { use, gatherReduce, useContext, useMemo, useOne } from '../live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, EMPTY_COLOR } from './constants';
import { RenderProvider, RenderContext } from './render-provider';

import {
  makeColorState,
  makeColorAttachment,
  makeRenderTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
} from '../core';

export type RenderToTextureProps = {
  width: number,
  height: number,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,

  children?: LiveElement<any>, 
};

export const RenderToTexture: LiveComponent<RenderToTextureProps> = (fiber) => (props) => {
  const renderContext = useContext(RenderContext);
  const {device} = renderContext;

  const {
    width = renderContext.width,
    height = renderContext.height,
    presentationFormat = PRESENTATION_FORMAT,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    backgroundColor = EMPTY_COLOR,
    children,
  } = props;
  
  const renderTexture = useMemo(() =>
    makeRenderTexture(
      device,
      width,
      height,
      presentationFormat
    ),
    [device, width, height, presentationFormat]
  );

  const colorStates      = useOne(() => [makeColorState(presentationFormat)], presentationFormat);
  const colorAttachments = useMemo(() =>
    [makeColorAttachment(renderTexture, backgroundColor)],
    [renderTexture, backgroundColor]
  );

  const [
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  ] = useMemo(() => {
      if (!depthStencilFormat) return [];

      const texture = makeDepthTexture(device, width, height, depthStencilFormat);
      const state = makeDepthStencilState(depthStencilFormat);
      const attachment = makeDepthStencilAttachment(texture);
      return [texture, state, attachment];
    },
    [device, width, height, depthStencilFormat]
  );

  const rttContext = useMemo(() => ({
    ...renderContext,
    width,
    height,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,
  }), [renderContext, width, height, colorStates, colorAttachments, depthTexture, depthStencilState, depthStencilAttachment]);

  const view = use(RenderProvider)({ renderContext: rttContext, children });

  const Done = useMemo(() =>
    (fiber: LiveFiber<any>) => (ts: Task[]) => {
      for (let task of ts) task();
    },
  );

  // @ts-ignore
  if (!Done.displayName) Done.displayName = '[RenderToTexture]';

  return gatherReduce(view, Done);
}
