import type { LC, PropsWithChildren, LiveFiber, LiveElement } from '@use-gpu/live';
import type { UseRenderingContextGPU, RenderPassMode } from '@use-gpu/core';

import { use, yeet, memo, multiGather, useContext, useMemo } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { PickingContext } from './picking';
import { useInspectable } from '../hooks/useInspectable'

export type PassProps = {
  transparent?: boolean,
  opaque?: boolean,
  picking?: boolean,
  debug?: boolean,
  render?: () => LiveElement<any>,
};

type RenderCounter = (v: number, t: number) => void;
export type RenderToPass = (passEncoder: GPURenderPassEncoder, countGeometry: RenderCounter) => void;

const toArray = <T>(x: T | T[]): T[] => Array.isArray(x) ? x : x != null ? [x] : []; 

export const Pass: LC<PassProps> = memo((props: PropsWithChildren<PassProps>) => {
  const {
    transparent = true, 
    opaque = true,
    debug = true,
    picking = true,
    children,
    render,
  } = props;

  const inspect = useInspectable();

  const Resume = (rs: Record<string, RenderToPass | RenderToPass[]>) => {
    const device = useContext(DeviceContext);
    const renderContext = useContext(RenderContext);
    const pickingContext = useContext(PickingContext);

    const opaques = toArray(rs['opaque']);
    const transparents = toArray(rs['transparent']);
    const debugs = toArray(rs['debug']);
    const pickings = toArray(rs['picking']);

    const visibles: RenderToPass[] = [];
    if (opaque) visibles.push(...opaques);
    if (transparent) visibles.push(...transparents);
    if (debug) visibles.push(...debugs);

    const renderToContext = (
      commandEncoder: GPUCommandEncoder,
      context: UseRenderingContextGPU,
      rs: RenderToPass[],
      countGeometry: RenderCounter,
    ) => {
      const {colorAttachments, depthStencilAttachment} = context;
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments,
        depthStencilAttachment: depthStencilAttachment ?? undefined,
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      for (let r of rs) r(passEncoder, countGeometry);
      passEncoder.end();
    };

    return yeet(() => {
      let vs = 0;
      let ts = 0;
      const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

      const commandEncoder = device.createCommandEncoder();

      renderContext.swapView();
      renderToContext(commandEncoder, renderContext, visibles, countGeometry);

      const shouldUpdatePicking = picking && pickingContext && pickings.length;
      if (shouldUpdatePicking) {
        const {renderContext} = pickingContext!;
        renderContext.swapView();
        renderToContext(commandEncoder, renderContext, pickings, countGeometry);
      }

      device.queue.submit([commandEncoder.finish()]);

      inspect({
        render: {
          vertexCount: vs,
          triangleCount: ts,
        },
      });
    });
  };

  return multiGather(children ?? (render ? render() : null), Resume);
}, 'Pass');
