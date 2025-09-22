import { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
import { gatherReduce, makeContext, useContext, useOne, useMemo, provide } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { FrameContext } from '../providers/frame-context';
import { PickingContext } from './picking';

export type DrawProps = {
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
};

const makeStaticDone = (c: any): any => {
  c.isStaticComponent = true;
  c.displayName = '[Draw]';
  return c;
}

const Done = makeStaticDone((fiber: LiveFiber<any>) => (ts: Task[]) => {
  const {device, gpuContext, colorAttachments, samples} = useContext(RenderContext);
  const pickingContext = useContext(PickingContext);

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

export const Draw: LiveComponent<DrawProps> = (fiber) => (props) => {
  const {children, render} = props;

  const frame = useOne(() => ({current: 0}));
  frame.current++;

  return provide(FrameContext, frame.current,
    gatherReduce(children ?? (render ? render() : null), Done)
  );
};
