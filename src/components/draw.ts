import { LiveFiber, LiveComponent, LiveElement, Task } from '../live/types';
import { gatherReduce, useContext, useMemo } from '../live';
import { RenderContext } from './render-provider';

export type DrawProps = {
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
};

const Done = (fiber: LiveFiber<any>) => (ts: Task[]) => {
  const {gpuContext, colorAttachments, samples} = useContext(RenderContext);

  const view = gpuContext
  // @ts-ignore
    .getCurrentTexture()
    .createView();

  // @ts-ignore
  if (samples > 1) colorAttachments[0].resolveTarget = view; 
  else colorAttachments[0].view = view;

  for (let task of ts) task();
};

// @ts-ignore
if (!Done.displayName) Done.displayName = '[Draw]';

export const Draw: LiveComponent<DrawProps> = (fiber) => (props) => {
  const {children, render} = props;

  return gatherReduce(children ?? (render ? render() : null), Done);
};
