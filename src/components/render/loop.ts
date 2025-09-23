import { LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
import { use, detach, useCallback, useOne, useResource } from '@use-gpu/live';

export type LoopProps = {
  gpuContext: GPUCanvasContext,
  colorAttachments: GPURenderPassColorAttachment[],
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
};

export type LoopRef = {
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
  dispatch?: () => void,
};

const Dispatch = () => (props: LoopRef) => props.children ?? (props.render ? props.render() : null);

export const Loop: LiveComponent<LoopProps> = (fiber) => (props) => {
  const {children, render} = props;

  const ref: LoopRef = useOne(() => ({children, render}));
  ref.children = children;
  ref.render = render;

  useResource((dispose) => {
    let running = true;

    const loop = () => {
      if (ref.dispatch) ref.dispatch();
      if (running) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
    dispose(() => running = false);
  });

  const fork = useOne(() => use(Dispatch)(ref));
  return detach(fork, (render: Task) => ref.dispatch = render);
}
