import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { Renderable } from './types';

import { use, yeet, memo, gather, useMemo, useOne } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useRenderContext } from '../providers/render-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { useInspectable } from '../hooks/useInspectable';

import { getMultiViewShader, getDisplayShader } from './display'; 
import { useSampleCopy } from './sample-copy';
import { getRenderPassDescriptor } from './util';

const {quote} = QueueReconciler;

export type DebugPassProps = {
  env: Record<string, any>,
  debug: string,
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<DebugPass>';

/** Debug render pass.

Renders raw render buffer.
*/
export const DebugPass: LC<DebugPassProps> = memo((props: PropsWithChildren<DebugPassProps>) => {
  const {env, debug} = props;

  const renderContext = useRenderContext();
  const device = useDeviceContext();

  const passContext = usePassContext();
  const {
    buffers: {[debug]: sourceBuffers},
    bindGroups: {view: bindGroup},
  } = passContext;

  if (!sourceBuffers) return null;

  // Multi-view strips of render buffers
  const getSample = useMemo(() => {
    const displays = sourceBuffers.map(c => getDisplayShader(c.source));
    return getMultiViewShader(displays, true);
  }, [sourceBuffers]);

  const draw = useSampleCopy(renderContext, getSample);

  // Render via a custom render pass
  const variants = () => SolidRender;

  const renderPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: `DebugPass/${debug}`}),
    renderContext);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    draw(passEncoder);
    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    return null;
  }));
}, 'DebugPass');


