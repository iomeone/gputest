import { LiveFiber, LiveComponent, LiveElement, Task } from '../live/types';
import { GPUPresentationContext } from '../webgpu/types';
import { gatherReduce, useContext, useMemo } from '../live';
import { RenderContext } from './render-provider';

export type DrawProps = {
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
};

const Done = (fiber: LiveFiber<any>) => (ts: Task[]) => {
  const {gpuContext, colorAttachments} = useContext(RenderContext);

  // @ts-ignore
  colorAttachments[0].view = gpuContext
  // @ts-ignore
    .getCurrentTexture()
    .createView();

  for (let task of ts) task();
};

// @ts-ignore
if (!Done.displayName) Done.displayName = '[Draw]';

export const Draw: LiveComponent<DrawProps> = (fiber) => (props) => {
  const {children, render} = props;

  return gatherReduce(children ?? (render ? render() : null), Done);
};
