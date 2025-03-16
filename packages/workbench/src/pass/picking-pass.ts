import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from './bindings';
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
  const {
    bindGroups: {view: bindGroup},
    buffers: {picking: [renderContext]},
    views: {view: {cull, uniforms}}
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);

  const pickings  = toArray(calls['picking'] as Renderable[]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {overlay, merge, label}),
    [renderContext, overlay, merge]);

  const inspected = inspect({
    output: {
      sources: [renderContext.source, renderContext.depth],
    },
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });

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

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));

}, 'PickingPass');
