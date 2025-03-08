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

import { getRenderPassDescriptor } from './util';
import { useRawTextureAccess } from '../hooks/useRawTextureAccess';
import { useSampleCopy } from './sample-copy';

const {quote} = QueueReconciler;

type SSAOCommand = (
  commandEncoder: GPUCommandEncoder,
) => void;

export type SSAOPassProps = {
  env: {
    ssao: { radius: number },
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Debug render pass.

Renders raw render buffer.
*/
export const DebugPass: LC<DebugPassProps> = memo((props: PropsWithChildren<DebugPassProps>) => {
  const {
    env: {debug: {buffer, index}},
  } = props;

  const renderContext = useRenderContext();
  const device = useDeviceContext();

  const {buffers} = usePassContext();
  const debugTarget = buffers[buffer]?.[index];
  if (!debugTarget) return null;

  const renderPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: `DebugPass/${buffer}/${index}`}),
    renderContext);

  const getSample = useRawTextureAccess(debugTarget.source).shader;
  const draw = useSampleCopy(renderContext, getSample);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(motionPassDescriptor);
    draw(passEncoder);
    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    return null;
  }));

}, 'DebugPass');


