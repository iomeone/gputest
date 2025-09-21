import { LiveComponent, LiveFiber, LiveElement } from '../live/types';
import { use, yeet, memo, gatherReduce, useContext, useMemo } from '../live';
import { RenderContext } from './render-provider';

export type PassProps = {
  device: GPUDevice,
  colorAttachments: GPURenderPassColorAttachment[],
  depthStencilAttachment: GPURenderPassDepthStencilAttachment,
  children: LiveElement<any>,
  render: () => LiveElement<any>,
};

export type RenderToPass = (passEncoder: GPURenderPassEncoder) => void;

export const Pass: LiveComponent<PassProps> = memo((fiber) => (props) => {
  const {children, render} = props;

  const Done = useMemo(() => (fiber: LiveFiber<any>) => (rs: RenderToPass[]) => {
    const {device, colorAttachments, depthStencilAttachment} = useContext(RenderContext);
    return yeet(() => {

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments,
        depthStencilAttachment,
      };

      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      for (let r of rs) r(passEncoder);
      passEncoder.endPass(),

      // @ts-ignore
      device.queue.submit([commandEncoder.finish()]);
    });
  }, []);

  // @ts-ignore
  if (!Done.displayName) Done.displayName = '[Pass]';

  return gatherReduce(children ?? (render ? render() : null), Done);
}, 'Pass');
