import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { XY } from '@use-gpu/core';
import { SSAOOptions } from '../pass/types';

import { use, yeet, memo, gather, useOne, useRef } from '@use-gpu/live';

import { useDebugContext } from '../providers/debug-provider';
import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from '../pass/bindings';
import { getRenderPassDescriptor } from './util';

import { SSAODispatch, SSAODebugPicking } from '../render/dispatch/ssao-dispatch';

const {quote} = QueueReconciler;

type SSAOCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type SSAOPassProps = {
  env: {
    light: any,
  },
  ssao: SSAOOptions,
};

const ZERO: XY = [0, 0];

const label = '<SSAOPass>';

/** SSAO render pass.

Resolves SSAO based on pre-existing normal + depth + motion vectors.
Renders to buffers allocated by SSAOBuffer (half res except for final resolve).
*/
export const SSAOPass: LC<SSAOPassProps> = memo((props: PropsWithChildren<SSAOPassProps>) => {
  const {
    env,
    ssao: ssaoOptions,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {
    buffers: {ssao},
    bindGroups: {pre: bindGroup},
    views: {pre: {uniforms}},
  } = usePassContext();

  const {ssao: ssaoDebug} = useDebugContext();
  const hasDebugPicking = !!ssaoDebug?.picking;
  const mouseRef = useRef(ZERO);

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
    hasDebugPicking ? use(SSAODebugPicking, {mouseRef}) : null,
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
      mouseRef: hasDebugPicking ? mouseRef : undefined,
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


