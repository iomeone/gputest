import { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
import {
  gather, provide, resume,
  makeContext, useContext, useOptionalContext, useNoContext,
} from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { FrameContext } from '../providers/frame-provider';
import { PickingContext } from './picking';

export type DrawProps = {
  live?: boolean,
  render?: () => LiveElement<any>,
  children?: LiveElement<any>,
};

export const Draw: LiveComponent<DrawProps> = (props) => {
  const {live, render, children} = props;

  if (live) useContext(FrameContext);
  else useNoContext(FrameContext);

  return gather(children ?? (render ? render() : null), Resume);
};

const Resume = resume((ts: Task[]) => {
  const {device, gpuContext, colorAttachments, samples} = useContext(RenderContext);
  const pickingContext = useContext(PickingContext);
  const frameContext = useOptionalContext(FrameContext);

  const view = gpuContext
  // @ts-ignore
    .getCurrentTexture()
    .createView();

  // @ts-ignore
  if (samples > 1) colorAttachments[0].resolveTarget = view; 
  else colorAttachments[0].view = view;

  for (let task of ts) task();
  if (pickingContext) pickingContext.captureTexture();
});
