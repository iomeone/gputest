import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { LightEnv, Renderable } from './types';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { useRenderContext } from '../providers/render-provider';
import { useViewContext } from '../providers/view-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPass } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type ColorPassProps = PropsWithChildren<{
  env: {
    light?: LightEnv,
  },
  calls: {
    opaque?: Renderable[],
    transparent?: Renderable[],
    debug?: Renderable[],
  },
  overlay?: boolean,
  merge?: boolean,
}>;

const label = '<ColorPass>';
const LABEL = { label };

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Color render pass.

Draws all opaque calls, then all transparent calls, then all debug wireframes.
*/
export const ColorPass: LC<ColorPassProps> = memo((props: ColorPassProps) => {
  const {
    overlay = false,
    merge = false,
    calls,
    env,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const {uniforms, cull} = useViewContext();
  const {bindPass, dataBindings} = useApplyPass(env, 'color');

  const opaques      = toArray(calls['opaque']      as Renderable[]);
  const transparents = toArray(calls['transparent'] as Renderable[]);
  const debugs       = toArray(calls['debug']       as Renderable[]);

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

    drawToPass(cull, opaques, passEncoder, countGeometry, uniforms);
    drawToPass(cull, transparents, passEncoder, countGeometry, uniforms, -1);
    drawToPass(cull, debugs, passEncoder, countGeometry, uniforms);

    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspect({
      output: renderContext.source ? {
        color: renderContext.source,
        depth: renderContext.depth,
      } : undefined,
      render: {
        vertices: vs,
        triangles: ts,
      },
      pass: { uniforms },
      bindings: dataBindings,
    });

    return null;
  }));
}, 'ColorPass');
