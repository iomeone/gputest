import { LiveComponent, LiveFiber, LiveElement } from '@use-gpu/live/types';
import { UseRenderingContextGPU, RenderPassMode } from '@use-gpu/core/types';
import { use, yeet, memo, multiGatherReduce, useContext, useMemo } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { PickingContext } from './picking';

export type PassProps = {
  children?: LiveElement<any>,
  render?: () => LiveElement<any>,
};

export type RenderToPass = (passEncoder: GPURenderPassEncoder) => void;

const makeStaticDone = (c: any): any => {
  c.isStaticComponent = true;
  c.displayName = '[Pass]';
  return c;
}

const toArray = <T>(x: T | T[]): T[] => Array.isArray(x) ? x : x ? [x] : []; 

export const Pass: LiveComponent<PassProps> = memo((fiber) => (props) => {
  const {children, render} = props;

  const Done = useMemo(() => makeStaticDone((fiber: LiveFiber<any>) => (rs: Record<string, RenderToPass | RenderToPass[]>) => {
    const renderContext = useContext(RenderContext);
    const pickingContext = useContext(PickingContext);

    const {device} = renderContext;

    const opaques = toArray(rs[RenderPassMode.Opaque]);
    const transparents = toArray(rs[RenderPassMode.Transparent]);
    const debugs = toArray(rs[RenderPassMode.Debug]);
    const pickings = toArray(rs[RenderPassMode.Picking]);

    const visibles = [...opaques, ...transparents, ...debugs];

    const renderToContext = (
      commandEncoder: GPUCommandEncoder,
      context: UseRenderingContextGPU,
      rs: RenderToPass[],
    ) => {
      const {colorAttachments, depthStencilAttachment} = context;
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments,
        depthStencilAttachment,
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      for (let r of rs) r(passEncoder);
      passEncoder.endPass();
    };

    return yeet(() => {
      const commandEncoder = device.createCommandEncoder();

      renderToContext(commandEncoder, renderContext, visibles);
      if (pickingContext) renderToContext(commandEncoder, pickingContext.renderContext, pickings);

      device.queue.submit([commandEncoder.finish()]);      
    });
  }), []);

  return multiGatherReduce(children ?? (render ? render() : null), Done);
}, 'Pass');
