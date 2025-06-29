import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { yeet, memo, useOne } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'
import { useTextureAccess, useTextureUVToXY } from '../hooks/useTextureAccess';
import { useCopySample } from '../render/copy/value-copy';

import { useApplyPassBindGroup } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type NormalPassProps = {
  env: Record<string, any>,
  calls: {
    normal: Renderable[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = "<NormalPass>";

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
    buffers: {normal: [renderContext, resolveContext]},
    views: {pre: {cull, uniforms}},
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);
  const {layout: globalLayout} = bindGroup;

  const normals = toArray(calls['normal'] as Renderable[]);

  const normalDepthPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: label + '/Render'}),
    renderContext);

  const resolvePassDescriptor = useOne(() =>
    resolveContext && getRenderPassDescriptor(resolveContext, {label: label + '/Resolve'}),
    resolveContext);

  const inspected = inspect({
    output: {
      sources: [renderContext.source, resolveContext?.source, renderContext.depth],
    },
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getSample = useTextureUVToXY(useTextureAccess(renderContext.source!)).shader;
  const resolveMSAA = useCopySample(resolveContext ?? renderContext, getSample, globalLayout);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();
    renderContext.swap?.();

    // Render normal buffer with depth
    {
      const passEncoder = commandEncoder.beginRenderPass(normalDepthPassDescriptor);
      bindPass?.(passEncoder);
      drawToPass(cull, normals, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    // Resolve MSAA target without blending samples
    if (resolveContext) {
      const passEncoder = commandEncoder.beginRenderPass(resolvePassDescriptor);
      bindPass?.(passEncoder);
      resolveMSAA(passEncoder);
      passEncoder.end();
    }

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));
}, 'NormalPass');


