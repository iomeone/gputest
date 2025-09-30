import type { LC, PropsWithChildren, ArrowFunction } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { use, yeet, memo, gather, useOne } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

import { MotionDispatch } from '../render/dispatch/motion-dispatch';

const {quote} = QueueReconciler;

export type MotionPassProps = {
  env: Record<string, any>,
  calls: {
    motion: Renderable[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = "<MotionPass>";
const LABEL = {label};

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
  const {
    bindGroups: {pre: bindGroup},
    buffers: {motion: [renderContext]},
    views: {pre: {cull, uniforms}},
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);

  const motions = toArray(calls['motion'] as Renderable[]);

  const motionPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, LABEL),
    renderContext);

  const resolveMotion = useOne(() => (
    use(MotionDispatch, {
      targetContext: renderContext,
      descriptor: motionPassDescriptor,
    })
  ), [renderContext, motionPassDescriptor]);

  const inspected = inspect({
    output: {
      color: [renderContext.source, renderContext.depth],
    },
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });

  return gather(resolveMotion, (calls: {motion: ArrowFunction}[]) => {

    return quote(yeet(() => {
      let vs = 0;
      let ts = 0;

      const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

      /*
      calls.forEach(({dispatch: f}) => f());
      */

      {
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
      }

      /*
      calls.forEach(({post: f}) => {
        const c = f();
        c && device.queue.submit([c]);
      });
      calls.forEach(({readback: f}) => f());
      */

      inspected.render.vertices = vs;
      inspected.render.triangles = ts;

      return null;
    }));
  });
}, 'MotionPass');
