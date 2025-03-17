import type { LC, PropsWithChildren } from '@use-gpu/live';

import { use, yeet, memo, gather, useOne } from '@use-gpu/live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from '../pass/bindings';
import { getRenderPassDescriptor } from './util';

import { SSAODispatch } from '../render/dispatch/ssao-dispatch';

const {quote} = QueueReconciler;

type SSAOCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type SSAOPassProps = {
  env: {
    light: any,
  },
  ssao: {
    radius?: number,
    depthRamp?: number,
    normalRamp?: number,
  } | number | true,
};

const DEFAULT_RADIUS = 1;

const label = '<SSAOPass>';

/** SSAO render pass.

Resolves SSAO based on pre-existing normal + depth + motion vectors.
Renders to buffers allocated by SSAOBuffer (half res except for final resolve).
*/
export const SSAOPass: LC<SSAOPassProps> = memo((props: PropsWithChildren<SSAOPassProps>) => {
  const {
    env,
    ssao: ssaoProp,
  } = props;
  
  const ssaoOptions = useOne(() => ({
    radius: DEFAULT_RADIUS,
    ...(
      ssaoProp === true ? {} :
      typeof ssaoProp === 'number' ? {radius: ssaoProp} :
      ssaoProp
    ),
  }), ssaoProp);

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {
    buffers: {ssao},
    bindGroups: {pre: bindGroup},
    views: {pre: {uniforms}},
  } = usePassContext();

  const [normalContext, motionXYContext, motionZContext, sampleContext, accumContext, resolveContext] = ssao;

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);
  const {layout: globalLayout} = bindGroup;

  const normalPassDescriptor = useOne(() =>
    getRenderPassDescriptor(normalContext, {label: 'SSAOPass/NormalDepth'}),
    normalContext);

  const motionXYPassDescriptor = useOne(() =>
    getRenderPassDescriptor(motionXYContext, {label: 'SSAOPass/MotionXY'}),
    motionXYContext);

  const motionZPassDescriptor = useOne(() =>
    getRenderPassDescriptor(motionZContext, {label: 'SSAOPass/MotionZ'}),
    motionZContext);

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
      mode: 'motion-xy',
      targetContext: motionXYContext,
      descriptor: motionXYPassDescriptor,
    }),
    use(SSAODispatch, {
      ...ssaoOptions,
      mode: 'motion-z',
      targetContext: motionZContext,
      descriptor: motionZPassDescriptor,
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
  ], [ssao, ssaoOptions, globalLayout]);

  inspect({
    output: {
      sources: [
        normalContext.source,
        normalContext.depth,
        motionXYContext.source,
        motionZContext.source,
        sampleContext.source,
        accumContext.source,
        resolveContext.source,
      ],
    },
    pass: uniforms,
    bindings: dataBindings,
  });

  return gather(resolveSSAO, (calls: {ssao: SSAOCommand}[]) => {

    return quote(yeet(() => {
      const commandEncoder = device.createCommandEncoder();

      // Resolve SSAO
      calls.forEach(({ssao: f}) => f(commandEncoder));
    
      const command = commandEncoder.finish();
      device.queue.submit([command]);

      return null;
    }));
  });
}, 'SSAOPass');


