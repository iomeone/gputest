import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { useViewContext } from '../providers/view-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPass } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type PickingPassProps = PropsWithChildren<{
  env: Record<string, any>,
  calls: {
    picking?: Renderable[],
  },
  overlay?: boolean,
  merge?: boolean,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<PickingPass>';
const LABEL = { label };

/** Picking render pass.

Draws all pickable objects as object ID / vertex ID pairs.
*/
export const PickingPass: LC<PickingPassProps> = memo((props: PickingPassProps) => {
  const {
    overlay = false,
    merge = false,
    calls,
    env,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {picking: [renderContext]}} = usePassContext();

  const {uniforms, cull} = useViewContext();
  const {bindPass, dataBindings} = useApplyPass(env, 'view');

  const pickings  = toArray(calls['picking'] as Renderable[]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {overlay, merge, label}),
    [renderContext, overlay, merge]);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder(LABEL);
    if (!overlay && !merge) renderContext.swap?.();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    bindPass?.(passEncoder);

    drawToPass(cull, pickings, passEncoder, countGeometry, uniforms);

    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspect({
      output: {
        picking: renderContext.source,
        depth: renderContext.depth,
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

}, 'PickingPass');
