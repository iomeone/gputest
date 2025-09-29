import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';

import { use, multiGather, memo, useMemo } from '@use-gpu/live';

import { FullScreenRenderer } from './full-screen-renderer';
import { ForwardRenderer } from './forward-renderer';
import { DeferredRenderer } from './deferred-renderer';

import { GBuffer } from './buffer/gbuffer';
import { PickingBuffer } from './buffer/picking-buffer';
import { ShadowBuffer } from './buffer/shadow-buffer';

export type PassProps = {
  mode?: 'forward' | 'deferred' | 'fullscreen',

  shadows?: boolean,
  lights?: boolean,
  picking?: boolean,
  overlay?: boolean,
  merge?: boolean,
};

const NO_BUFFERS: any = {};

export const Pass: LC<PassProps> = memo((props: PropsWithChildren<PassProps>) => {
  const {
    mode = 'forward',
    lights = false,
    shadows = false,
    picking = false,

    overlay = false,
    merge = false,

    children,
  } = props;

  if (mode === 'fullscreen') {
    return use(FullScreenRenderer, {
      overlay,
      merge,
      children,
    });
  }
  if (mode === 'forward') {
    if (!shadows && !picking) return use(ForwardRenderer, {buffers: NO_BUFFERS, lights, overlay, merge, children});
    
    const buffers = useMemo(() => [
      shadows ? use(ShadowBuffer, {}) : null,
      picking ? use(PickingBuffer, {}) : null,
    ], [shadows, picking]);
    
    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(ForwardRenderer, {buffers, lights, overlay, merge, children})
    );
  }
  if (mode === 'deferred') {
    if (!shadows && !picking) return use(DeferredRenderer, {buffers: NO_BUFFERS, overlay, merge, children})

    const buffers = useMemo(() => [
      use(GBuffer),
      shadows ? use(ShadowBuffer, {}) : null,
      picking ? use(PickingBuffer, {}) : null,
    ], [shadows, picking]);

    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(DeferredRenderer, {buffers, overlay, merge, children})
    );
  }

  return null;
}, 'Pass');
