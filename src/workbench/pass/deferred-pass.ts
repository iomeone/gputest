import type { LC, PropsWithChildren, LiveFiber, LiveElement, ArrowFunction } from '@use-gpu/live';
import type { Culler, LightEnv, Renderable } from './types';

import { use, quote, yeet, memo, gather, useMemo, useOne } from '@use-gpu/live';

import { useRenderContext } from '../providers/render-provider';
import { useDeviceContext } from '../providers/device-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';

import { useInspectable } from '../hooks/useInspectable'
import { useDepthBlit } from './depth-blit';

import { getRenderPassDescriptor, drawToPass } from './util';

export type DeferredPassProps = {
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
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 

/** Deferred render pass.

Draws all opaque calls to gbuffer, then stencils lights, then draws lights, then all transparent calls, then all debug wireframes.
*/
export const DeferredPass: LC<DeferredPassProps> = memo((props: PropsWithChildren<DeferredPassProps>) => {
  const {
    overlay = false,
    merge = false,
    calls,
    env: {light},
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();
  const {width, height, depthTexture} = renderContext;
  const {bind: bindGlobal, cull, uniforms} = useViewContext();
  const {bind: makeBindPass, buffers: {gbuffer: [gbuffer]}} = usePassContext();

  if (!depthTexture) throw new Error("Deferred renderer requires a depth buffer");

  const opaques      = toArray(calls['opaque']      as Renderable[]);
  const transparents = toArray(calls['transparent'] as Renderable[]);
  const debugs       = toArray(calls['debug']       as Renderable[]);

  const stencils     = toArray(calls['stencil']     as Renderable[]);
  const lights       = toArray(calls['light']       as Renderable[]);

  const bindPass = useOne(() => {
    if (!light || !makeBindPass) return () => {};
    const {storage, texture} = light;
    return makeBindPass(storage, texture); 
  }, light);

  const deferredPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(gbuffer, {
      overlay: false,
      merge,
    }),
    [gbuffer, merge]);

  const stencilPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      stencil: true,
    }),
    [renderContext]);

  const renderPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(renderContext, {
      overlay,
      merge: true,
    }),
    [renderContext, overlay]);
  
  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();
    if (!overlay && !merge) renderContext.swap?.();

    {
      const passEncoder = commandEncoder.beginRenderPass(deferredPassDescriptor);
      bindGlobal(passEncoder);
      drawToPass(cull, opaques, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    commandEncoder.copyTextureToTexture(
      {texture: depthTexture},
      {texture: gbuffer.sources![4].texture},
      [width, height, 1]
    );

    if (stencils.length) {
      const passEncoder = commandEncoder.beginRenderPass(stencilPassDescriptor);
      bindGlobal(passEncoder);
      bindPass(passEncoder);

      drawToPass(cull, stencils, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    {
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      bindGlobal(passEncoder);
      bindPass(passEncoder);

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
    });

    return null;
  }));
}, 'DeferredPass');
