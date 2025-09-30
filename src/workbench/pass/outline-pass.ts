import type { LC, PropsWithChildren } from '../../live';
import { OutlineOptions } from '../pass/types';

import { use, yeet, memo, gather, useOne } from '../../live';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { useRenderContext } from '../providers/render-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useApplyPassBindGroup } from '../pass/bindings';
import { getRenderPassDescriptor } from './util';

import { OutlineDispatch } from '../render/dispatch/outline-dispatch';

const {quote} = QueueReconciler;

type OutlineCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type OutlinePassProps = {
  env: {
    light: any,
  },
  facets: boolean,
  outline: OutlineOptions,
};

const label = '<OutlinePass>';

/** Outline render pass.

Renders outer/inner edge mask to offscreen target, then applies variable sized outlines via convolution.
*/
export const OutlinePass: LC<OutlinePassProps> = memo((props: PropsWithChildren<OutlinePassProps>) => {
  const {
    env,
    facets,
    outline: outlineOptions,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const {
    buffers: {outline},
    bindGroups: {pre: bindGroup},
    views: {pre: {uniforms}},
  } = usePassContext();

  const [edgeContext] = outline;

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);
  const {layout: globalLayout} = bindGroup;

  const edgePassDescriptor = useOne(() =>
    getRenderPassDescriptor(edgeContext, {label: 'OutlinePass/Edge'}),
    edgeContext);

  const resolvePassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: 'OutlinePass/Resolve', overlay: true, merge: true}),
    renderContext);

  const resolveOutline = useOne(() => [
    use(OutlineDispatch, {
      ...outlineOptions,
      mode: 'edge',
      facets,

      targetContext: edgeContext,
      descriptor: edgePassDescriptor,

      bindPass,
      globalLayout,
    }),
    use(OutlineDispatch, {
      ...outlineOptions,
      mode: 'resolve',

      targetContext: renderContext,
      descriptor: resolvePassDescriptor,

      bindPass,
      globalLayout,
    }),
  ], [outline, outlineOptions, globalLayout]);

  inspect({
    output: {
      sources: [
        edgeContext.source,
      ],
    },
    pass: uniforms,
    bindings: dataBindings,
  });

  return gather(resolveOutline, (calls: {outline: OutlineCommand}[]) => {

    return quote(yeet(() => {
      const commandEncoder = device.createCommandEncoder();

      // Resolve outline
      calls.forEach(({outline: f}) => f(commandEncoder));

      const command = commandEncoder.finish();
      device.queue.submit([command]);

      return null;
    }));
  });
}, 'OutlinePass');


