import type { LC, PropsWithChildren } from '@use-gpu/live';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { proxy } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useRenderContext } from '../providers/render-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers';

import { getMultiViewShader, getDisplayShader } from '../hooks/useDisplayShader'; 
import { useCopySample } from '../render/copy/value-copy';

import { getRenderPassDescriptor } from './util';

const {quote} = QueueReconciler;

export type DebugPassProps = {
  env: Record<string, any>,
  debug: string,
  debugIndex: number,
};

/** Debug render pass.

Renders raw render buffer.
*/
export const DebugPass: LC<DebugPassProps> = memo((props: PropsWithChildren<DebugPassProps>) => {
  const {debug, debugIndex} = props;

  const renderContext = useRenderContext();
  const device = useDeviceContext();

  const passContext = usePassContext();
  const {
    buffers: {[debug]: sourceBuffers},
  } = passContext;

  if (!sourceBuffers) return null;

  // Multi-view strips of render buffers
  const getSample = useMemo(() => {

    // Isolate 1 buffer
    if (debugIndex != null) {
      const {source} = sourceBuffers[debugIndex];
      const display = getDisplayShader(source);

      if (source.format.match(/rgba/)) {
        const alpha = getDisplayShader(proxy(source, {hint: 'alpha'}));
        return getMultiViewShader([display, alpha]);
      }
      return display;
    }

    // All buffers
    else {
      const displays = sourceBuffers.map(c => getDisplayShader(c.source));
      return getMultiViewShader(displays);
    }
  }, [sourceBuffers, debugIndex]);

  const draw = useCopySample(renderContext, getSample);

  const renderPassDescriptor = useOne(() =>
    getRenderPassDescriptor(renderContext, {label: `DebugPass/${debug}`}),
    renderContext);

  return quote(yeet(() => {
    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    draw(passEncoder);
    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    return null;
  }));
}, 'DebugPass');


