import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { use, yeet, memo, multiGather, useMemo, useOne } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

type SSAOCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type NormalPassProps = {
  env: Record<string, any>,
  calls: {
    normal: Renderable[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = "<NormalPass>";
const LABEL = {label};

/** Normal (+depth) render pass.

Draws 'normal' calls to normal buffer.
*/
export const NormalPass: LC<NormalPassProps> = memo((props: PropsWithChildren<NormalPassProps>) => {
  const {
    env,
    calls,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {
    bindGroups: {pre: bindGroup},
    buffers: {normal: [renderContext]},
    views: {pre: {cull, uniforms}},
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);

  const normals = toArray(calls['normal'] as Renderable[]);

  const normalDepthPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, LABEL),
    renderContext);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();
    renderContext.swap?.();

    // Render normal buffer with depth
    const passEncoder = commandEncoder.beginRenderPass(normalDepthPassDescriptor);
    bindPass?.(passEncoder);
    drawToPass(cull, normals, passEncoder, countGeometry, uniforms);
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
      pass: uniforms,
      bindings: dataBindings,
    });

    return null;
  }));
}, 'NormalPass');


