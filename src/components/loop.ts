import { LiveComponent, LiveElement, Task } from '../live/types';
import { GPUPresentationContext } from '../webgpu/types';
import { use, detach, useCallback, useOne, useResource } from '../live';

export type LoopProps = {
  gpuContext: GPUPresentationContext,
  colorAttachments: GPURenderPassColorAttachmentDescriptor[],
  children?: LiveElement<any>,
  update?: () => void,
  render?: () => LiveElement<any>,
};

export type LoopRef = {
  children?: LiveElement<any>,
  update?: () => void,
  render?: () => LiveElement<any>,
};

const Paint = () => (ref: LoopRef) => ref.children ?? (ref.render ? ref.render() : null);

export const Loop: LiveComponent<LoopProps> = (fiber) => (props) => {
  const {gpuContext, colorAttachments, children, update, render} = props;

  const ref: LoopRef = useOne(() => ({children, update, render}));
  ref.children = children;
  ref.update = update;
  ref.render = render;

  const fork = useOne(() => use(Paint)(ref));
  return detach(fork, (render: Task) => {
    useResource((dispose) => {
      let running = true;

      const loop = () => {
        if (ref.update) ref.update();

        // @ts-ignore
        colorAttachments[0].view = gpuContext
        // @ts-ignore
          .getCurrentTexture()
          .createView();

        render();

        if (running) requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
      dispose(() => running = false);
    });
  });
}
