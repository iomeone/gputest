import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { LightEnv, Renderable } from './types';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useRenderContext } from '../providers/render-provider';
import { useDeviceContext } from '../providers/device-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPass } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type DeferredPassProps = PropsWithChildren<{
  env: {
    light?: LightEnv,
  },
  calls: {
    opaque?: Renderable[],
    transparent?: Renderable[],
    debug?: Renderable[],
    stencil?: Renderable[],
    light?: Renderable[],
  },
  overlay?: boolean,
  merge?: boolean,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<DeferredPass>';
const LABEL = { label };

/** Deferred render pass.

Draws all opaque calls to gBuffer, then stencils lights, then draws lights, then all transparent calls, then all debug wireframes.
*/
export const DeferredPass: LC<DeferredPassProps> = memo((props: DeferredPassProps) => {
  const {
    overlay = false,
    merge = false,
    calls,
    env,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();
  const {width, height, depth} = renderContext;

  const {cull, uniforms} = useViewContext();
  const {
    buffers: {gBuffer: [gBuffer]},
  } = usePassContext();

  const {bindPass: bindViewPass} = useApplyPass(env, 'view');
  const {bindPass: bindColorPass, dataBindings} = useApplyPass(env, 'color');

  if (!depth) throw new Error("Deferred renderer requires a depth buffer");

  const opaques      = toArray(calls['opaque']      as Renderable[]);
  const transparents = toArray(calls['transparent'] as Renderable[]);
  const debugs       = toArray(calls['debug']       as Renderable[]);

  const stencils     = toArray(calls['stencil']     as Renderable[]);
  const lights       = toArray(calls['light']       as Renderable[]);

  const deferredPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(gBuffer, {
      label: '<DeferredPass> GBuffer',
      overlay: false,
      merge,
    }),
    [gBuffer, merge]);

  const stencilPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      label: '<DeferredPass> GBuffer',
      stencil: true,
    }),
    [renderContext]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      label: '<DeferredPass> Color',
      overlay,
      merge: true,
    }),
    [renderContext, overlay]);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder(LABEL);
    if (!overlay && !merge) renderContext.swap?.();

    {
      const passEncoder = commandEncoder.beginRenderPass(deferredPassDescriptor);
      bindViewPass?.(passEncoder);
      drawToPass(cull, opaques, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    commandEncoder.copyTextureToTexture(
      {texture: depth.texture},
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {texture: gBuffer.sources![4].texture},
      [width, height, 1]
    );

    if (stencils.length) {
      const passEncoder = commandEncoder.beginRenderPass(stencilPassDescriptor);
      bindColorPass?.(passEncoder);

      drawToPass(cull, stencils, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    {
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      bindColorPass?.(passEncoder);

      drawToPass(cull, lights, passEncoder, countGeometry, uniforms);
      drawToPass(cull, transparents, passEncoder, countGeometry, uniforms, -1);
      drawToPass(cull, debugs, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspect({
      output: {
        color: renderContext.source,
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
}, 'DeferredPass');
