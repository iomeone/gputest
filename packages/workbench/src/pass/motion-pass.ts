import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { use, yeet, memo, gather, useOne } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useRenderContext } from '../providers/render-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPass } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

import { MotionDispatch } from '../render/dispatch/motion-dispatch';

import { wgsl } from '@use-gpu/shader/wgsl';

const {quote} = QueueReconciler;

export type MotionPassProps = {
  env: Record<string, any>,
  calls: {
    motion: Renderable[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Motion render pass.

Fills motion buffer using current depth map,
then draws all (custom) motion calls on top.
*/
export const MotionPass: LC<MotionPassProps> = memo((props: PropsWithChildren<MotionPassProps>) => {
  const {
    env,
    calls,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {motion: [renderContext]}} = usePassContext();

  const {cull, uniforms} = useViewContext();
  const {bindPass, dataBindings} = useApplyPass(env, 'view');

  const motions = toArray(calls['motion'] as Renderable[]);

  const motionPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: 'MotionPass'}),
    renderContext);

  const resolveMotion = useOne(() => (
    use(MotionDispatch, {
      targetContext: renderContext,
      descriptor: motionPassDescriptor,
    })
  ), [renderContext, motionPassDescriptor]);

  return gather(resolveMotion, (calls: {motion: Renderable}[]) => {

    return quote(yeet(() => {
      let vs = 0;
      let ts = 0;

      const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

      const commandEncoder = device.createCommandEncoder();
      renderContext.swap?.();

      // Render motion buffer
      const passEncoder = commandEncoder.beginRenderPass(motionPassDescriptor);
      bindPass?.(passEncoder);

      calls.forEach(({motion: f}) => f(passEncoder));
      drawToPass(cull, motions, passEncoder, countGeometry, uniforms);

      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);

      inspect({
        output: {
          color: [
            renderContext.source,
            renderContext.depth,
          ],
        },
        render: {
          vertices: vs,
          triangles: ts,
        },
        pass: { uniforms },
        bindings: dataBindings,
      });

      return null;
    }));
  });
}, 'MotionPass');
