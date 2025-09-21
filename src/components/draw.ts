import { LiveComponent, LiveElement } from '../live/types';
import { GPUPresentationContext } from '../webgpu/types';
import {
  defer, fork, useCallback, useOne, useResource, useSubContext, renderContext,
} from '../live';

export type DrawProps = {
  gpuContext: GPUPresentationContext,
  colorAttachments: GPURenderPassColorAttachmentDescriptor[],
  render: () => LiveElement<any>,
};

export type DrawRef = {
  render: () => LiveElement<any>,
};

const Paint = () => (ref: DrawRef) => ref.render();

export const Draw: LiveComponent<DrawProps> = (context) => (props) => {
  const {gpuContext, colorAttachments, render} = props;

  const ref: DrawRef = useOne(context, 0)(() => ({render}));
  ref.render = render;

  const subContext = useSubContext(context, 1)(defer(Paint)(ref));

  // @ts-ignore
  colorAttachments[0].view = gpuContext
  // @ts-ignore
    .getCurrentTexture()
    .createView();

  renderContext(subContext);

  return fork(subContext);
}
