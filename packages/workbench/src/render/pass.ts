import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { PassFlags, RenderComponents } from '../pass/types';

import { use, multiGather, memo, useMemo } from '@use-gpu/live';

import { FullScreenRenderer } from './full-screen-renderer';
import { ForwardRenderer } from './forward-renderer';
import { DeferredRenderer } from './deferred-renderer';

import { GBuffer } from './buffer/gbuffer';
import { PickingBuffer } from './buffer/picking-buffer';
import { ShadowBuffer } from './buffer/shadow-buffer';

export type PassProps = PropsWithChildren<{
  mode?: 'forward' | 'deferred' | 'fullscreen',
  components?: RenderComponents,
} & PassFlags>;

const NO_BUFFERS: any = {};

export const Pass: LC<PassProps> = memo((props: PassProps) => {
  const {
    mode = 'forward',

    lights = false,
    shadows = false,
    picking = false,

    overlay = false,
    merge = false,
    
    components,

    children,
  } = props;

  const flags = {
    lights,
    shadows,
    picking,

    overlay,
    merge,
  };

  if (mode === 'fullscreen') {
    return use(FullScreenRenderer, {
      flags,
      children,
    });
  }
  if (mode === 'forward') {
    if (!shadows && !picking) return use(ForwardRenderer, {buffers: NO_BUFFERS, components, flags, children});

    const buffers = useMemo(() => [
      shadows ? use(ShadowBuffer, {}) : null,
      picking ? use(PickingBuffer, {}) : null,
    ], [shadows, picking]);

    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(ForwardRenderer, {buffers, lights, flags, children})
    );
  }
  if (mode === 'deferred') {
    if (!shadows && !picking) return use(DeferredRenderer, {buffers: NO_BUFFERS, components, flags, children})

    const buffers = useMemo(() => [
      use(GBuffer),
      shadows ? use(ShadowBuffer, {}) : null,
      picking ? use(PickingBuffer, {}) : null,
    ], [shadows, picking]);

    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(DeferredRenderer, {buffers, components, flags, children})
    );
  }

  return null;
}, 'Pass');
