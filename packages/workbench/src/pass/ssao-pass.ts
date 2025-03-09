import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { Renderable } from '../pass';

import { use, yeet, memo, gather, useMemo, useOne } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useRenderContext } from '../providers/render-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPass } from '../pass/bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

import { SSAODispatch } from '../render/dispatch/ssao-dispatch';

const {quote} = QueueReconciler;

type SSAOCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type SSAOPassProps = {
  env: {
  },
  flags: {
    ssao: boolean | number | { radius: number },
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const DEFAULT_RADIUS = 1;

/** SSAO render pass.

Resolves SSAO based on pre-existing normal + depth + motion vectors.
*/
export const SSAOPass: LC<SSAOPassProps> = memo((props: PropsWithChildren<SSAOPassProps>) => {
  const {
    env,
    flags,
  } = props;
  
  const ssaoOptions = useOne(() => ({
    radius: (typeof flags.ssao === 'number' ? flags.ssao : flags.ssao.radius) || DEFAULT_RADIUS,
    ...(typeof flags.ssao === 'object' ? flags : {}),
  }), flags);

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {ssao}, bindGroups: {view: {layout: globalLayout}}} = usePassContext();

  const [normalContext, motionContext, sampleContext, accumContext, resolveContext] = ssao;
  const debugContext = useRenderContext();

  const {cull, uniforms} = useViewContext();
  const {bindPass, dataBindings} = useApplyPass(env, 'view');

  const normalPassDescriptor = useOne(() =>
    getRenderPassDescriptor(normalContext, {label: 'SSAOPass/NormalDepth'}),
    normalContext);

  const motionPassDescriptor = useOne(() =>
    getRenderPassDescriptor(motionContext, {label: 'SSAOPass/Motion'}),
    motionContext);

  const samplePassDescriptor = useOne(() =>
    getRenderPassDescriptor(sampleContext, {label: 'SSAOPass/Sample'}),
    sampleContext);

  const accumPassDescriptor = useOne(() =>
    getRenderPassDescriptor(accumContext, {label: 'SSAOPass/Accum'}),
    accumContext);

  const resolvePassDescriptor = useOne(() =>
    getRenderPassDescriptor(resolveContext, {label: 'SSAOPass/Resolve'}),
    resolveContext);

  const resolveSSAO = useOne(() => [
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'normal',
      targetContext: normalContext,
      descriptor: normalPassDescriptor,
    }),
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'motion',
      targetContext: motionContext,
      descriptor: motionPassDescriptor,
    }),
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'sample',
      targetContext: sampleContext,
      descriptor: samplePassDescriptor,

      bindPass,
      globalLayout,
    }),
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'accum',
      targetContext: accumContext,
      descriptor: accumPassDescriptor,
      bindPass,
    }),
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'resolve',
      targetContext: resolveContext,
      descriptor: resolvePassDescriptor,
      bindPass,
    }),
  ], [ssao, ssaoOptions]);
  
  return gather(resolveSSAO, (calls: {ssao: SSAOCommand}[]) => {

    return quote(yeet(() => {
      let vs = 0;
      let ts = 0;

      const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

      const commandEncoder = device.createCommandEncoder();

      // Resolve SSAO
      calls.forEach(({ssao: f}) => f(commandEncoder));
    
      const command = commandEncoder.finish();
      device.queue.submit([command]);

      inspect({
        output: {
          color: [
            normalContext.source,
            normalContext.depth,
            motionContext.source,
            sampleContext.source,
            accumContext.source,
            resolveContext.source,
          ],
        },
        render: {
          vertices: vs,
          triangles: ts,
        },
        pass: {uniforms},
        bindings: dataBindings,
      });

      return null;
    }));
  });
}, 'SSAOPass');


