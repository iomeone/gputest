import type { LC, PropsWithChildren } from '../../live';
import type { LightEnv, Renderable } from './types';

import { yeet, memo, useMemo } from '../../live';

import { useRenderContext } from '../providers/render-provider';
import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type DeferredResolvePassProps = PropsWithChildren<{
  env: {
    light?: LightEnv,
  },
  calls: {
    transparent?: Renderable[],
    debug?: Renderable[],
    stencil?: Renderable[],
    light?: Renderable[],
  },
  overlay?: boolean,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<DeferredResolvePass>';
const LABEL = { label };

/** Deferred resolve render pass.

Draws stencils for lights, then draws lights, then all transparent calls, then all debug wireframes.
*/
export const DeferredResolvePass: LC<DeferredResolvePassProps> = memo((props: DeferredResolvePassProps) => {
  const {
    overlay = true,
    calls,
    env,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const {
    bindGroups: {color: bindGroup},
    views: {view: {cull, uniforms}},
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);

  const transparents = toArray(calls['transparent'] as Renderable[]);
  const debugs       = toArray(calls['debug']       as Renderable[]);

  const stencils     = toArray(calls['stencil']     as Renderable[]);
  const lights       = toArray(calls['light']       as Renderable[]);

  const stencilPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      label: '<DeferredResolvePass> Stencil',
      stencil: true,
    }),
    [renderContext]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      label: '<DeferredResolvePass> Color',
      overlay,
      merge: true,
    }),
    [renderContext, overlay]);

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

    if (stencils.length) {
      const passEncoder = commandEncoder.beginRenderPass(stencilPassDescriptor);
      bindPass?.(passEncoder);

      drawToPass(cull, stencils, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    {
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      bindPass?.(passEncoder);

      drawToPass(cull, lights, passEncoder, countGeometry, uniforms);
      drawToPass(cull, transparents, passEncoder, countGeometry, uniforms, -1);
      drawToPass(cull, debugs, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));
}, 'DeferredResolvePass');
