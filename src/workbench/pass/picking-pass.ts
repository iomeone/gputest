import type { LC, PropsWithChildren, LiveFiber, LiveElement, ArrowFunction } from '@use-gpu/live';
import type { Culler, Renderable } from '../pass';

import { use, quote, yeet, memo, useMemo } from '@use-gpu/live';

import { usePickingContext } from '../providers/picking-provider';
import { useDeviceContext } from '../providers/device-provider';
import { useViewContext } from '../providers/view-provider';

import { useInspectable } from '../hooks/useInspectable'

import { getRenderPassDescriptor, drawToPass } from './util';

export type PickingPassProps = {
  calls: {
    picking?: Renderable[],
  },
  overlay?: boolean,
  merge?: boolean,
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 

/** Picking render pass.

Draws all pickable objects as object ID / vertex ID pairs.
*/
export const PickingPass: LC<PickingPassProps> = memo((props: PropsWithChildren<PickingPassProps>) => {
  const {
    overlay = false,
    merge = false,
    calls,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const pickingContext = usePickingContext();
  const {cull, bind, uniforms} = useViewContext();

  const {renderContext} = pickingContext;

  const pickings  = toArray(calls['picking'] as Renderable[]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {overlay, merge}),
    [renderContext, overlay, merge]);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();
    if (!overlay && !merge) renderContext.swap?.();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    bind(passEncoder);

    drawToPass(cull, pickings, passEncoder, countGeometry, uniforms);

    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspect({
      output: {
        picking: renderContext.source,
      },
      render: {
        vertices: vs,
        triangles: ts,
      },
    });

    return null;
  }));

}, 'PickingPass');
