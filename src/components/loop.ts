import { LiveComponent, LiveElement } from '../live/types';
import {
  useResource,

} from '../live/hooks';

import {
  defer,
} from '../live/live'

import {
  useCallback, useOne,
} from '../live/hooks';

import {prepareSubContext, renderContext} from '../live/tree'
export type LoopProps = {
  swapChain: GPUSwapChain,
  colorAttachments: GPURenderPassColorAttachmentDescriptor[],
  update: () => void,
  render: () => LiveElement<any>,
};

export type LoopRef = {
  update: () => void,
  render: () => LiveElement<any>,
};

export const Loop: LiveComponent<LoopProps> = (context) => (props) => {
  const {swapChain, colorAttachments, update, render} = props;

  const ref: LoopRef = useOne(context, 0)(() => ({update, render}));
  ref.update = update;
  ref.render = render;

  const paint = useCallback(context, 1)(() => (ref: LoopRef) => ref.render());
  const subContext = useOne(context, 2)(() => prepareSubContext(context, defer(paint)(ref)));

  useResource(context, 3)((dispose) => {
    let running = true;

    const loop = () => {
      if (ref.update) ref.update();

      colorAttachments[0].attachment = swapChain
        .getCurrentTexture()
        .createView();

      renderContext(subContext);

      if (running) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
    dispose(() => {
      running = false;
      if (subContext?.host) subContext.host.dispose(subContext);
    });
  });

  return null;
}
