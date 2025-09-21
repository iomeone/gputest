import { LiveComponent, LiveElement } from '../live/types';
import { GPUPresentationContext } from '../webgpu/types';
import {
  defer, fork, useCallback, useOne, useResource, useSubContext, renderContext,
} from '../live';

export type LoopProps = {
  gpuContext: GPUPresentationContext,
  colorAttachments: GPURenderPassColorAttachmentDescriptor[],
  update: () => void,
  render: () => LiveElement<any>,
};

export type LoopRef = {
  update: () => void,
  render: () => LiveElement<any>,
};

const Paint = () => (ref: LoopRef) => ref.render();

export const Loop: LiveComponent<LoopProps> = (context) => (props) => {
  const {gpuContext, colorAttachments, update, render} = props;

  const ref: LoopRef = useOne(context, 0)(() => ({update, render}));
  ref.update = update;
  ref.render = render;

  const subContext = useSubContext(context, 2)(defer(Paint)(ref));

  useResource(context, 3)((dispose) => {
    let running = true;

    const loop = () => {
      if (ref.update) ref.update();

      // @ts-ignore
      colorAttachments[0].view = gpuContext
      // @ts-ignore
        .getCurrentTexture()
        .createView();

      renderContext(subContext);

      if (running) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
    dispose(() => running = false);
  });

  return fork(subContext);
}
