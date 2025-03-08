import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { PassFlags, RenderComponents } from '../pass/types';

import { use, multiGather, memo, useMemo } from '@use-gpu/live';

import { FullScreenRenderer } from './full-screen-renderer';
import { ForwardRenderer } from './forward-renderer';
import { DeferredRenderer } from './deferred-renderer';

import { GBuffer } from './buffer/g-buffer';
import { NormalBuffer } from './buffer/normal-buffer';
import { MotionBuffer } from './buffer/motion-buffer';
import { SSAOBuffer } from './buffer/ssao-buffer';
import { PickingBuffer } from './buffer/picking-buffer';
import { ShadowBuffer } from './buffer/shadow-buffer';

export type PassProps = PropsWithChildren<{
  mode?: 'forward' | 'deferred' | 'fullscreen',
  components?: RenderComponents,
} & PassFlags>;

const NONE: any = {};

export const Pass: LC<PassProps> = memo((props: PassProps) => {
  const {
    mode = 'forward',

    lights = false,
    shadows = false,
    picking = false,
    ssao = 0,

    overlay = false,
    merge = false,
    
    components,

    children,
  } = props;

  const flags = {
    lights,
    shadows,
    picking,

    ssao,

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
    if (!ssao && !shadows && !picking) return use(ForwardRenderer, {buffers: NONE, components, flags, children});

    const buffers = useMemo(() => [
      ...(ssao ? [
        use(NormalBuffer, NONE),
        use(MotionBuffer, NONE),
      ] : []),
      ssao ? use(SSAOBuffer, NONE) : null,
      shadows ? use(ShadowBuffer, NONE) : null,
      picking ? use(PickingBuffer, NONE) : null,
    ], [ssao, shadows, picking]);

    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(ForwardRenderer, {buffers, lights, flags, children})
    );
  }
  if (mode === 'deferred') {
    if (!shadows && !picking) return use(DeferredRenderer, {buffers: NONE, components, flags, children})

    const buffers = useMemo(() => [
      use(GBuffer),
      // ssao ? use(SSAOBuffer, NONE) : null,
      shadows ? use(ShadowBuffer, NONE) : null,
      picking ? use(PickingBuffer, NONE) : null,
    ], [shadows, picking]);

    return multiGather(buffers, (buffers: Record<string, UseGPURenderContext[]>) =>
      use(DeferredRenderer, {buffers, components, flags, children})
    );
  }

  return null;
}, 'Pass');
