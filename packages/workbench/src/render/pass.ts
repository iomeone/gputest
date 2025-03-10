import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { PassFlags, RenderComponents } from '../pass/types';

import { use, gather, memo, useMemo } from '@use-gpu/live';

import { FullScreenRenderer } from './full-screen-renderer';
import { ForwardRenderer } from './forward-renderer';
import { DeferredRenderer } from './deferred-renderer';

import { GBuffer } from './buffer/g-buffer';
import { NormalBuffer } from './buffer/normal-buffer';
import { MotionBuffer } from './buffer/motion-buffer';
import { SSAOBuffer } from './buffer/ssao-buffer';
import { PickingBuffer } from './buffer/picking-buffer';
import { ShadowBuffer } from './buffer/shadow-buffer';

import { PassResource } from '../pass/types';

const NONE: any = {};

export type PassProps = PropsWithChildren<{
  mode?: 'forward' | 'deferred' | 'fullscreen',
  components?: RenderComponents,
} & PassFlags>;

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
    if (!ssao && !shadows && !picking) return use(ForwardRenderer, {components, flags, children});

    const resources = useMemo(() => [
      ...(ssao ? [
        use(NormalBuffer, NONE),
        use(MotionBuffer, NONE),
      ] : []),
      ssao ? use(SSAOBuffer, NONE) : null,
      shadows ? use(ShadowBuffer, NONE) : null,
      picking ? use(PickingBuffer, NONE) : null,
    ], [ssao, shadows, picking]);

    return gatherPassResources(resources, (resources: PassResources) =>
      use(ForwardRenderer, {resources, lights, flags, children})
    );
  }
  if (mode === 'deferred') {
    if (!shadows && !picking) return use(DeferredRenderer, {components, flags, children})

    const resources = useMemo(() => [
      use(GBuffer),
      // ssao ? use(SSAOBuffer, NONE) : null,
      shadows ? use(ShadowBuffer, NONE) : null,
      picking ? use(PickingBuffer, NONE) : null,
    ], [shadows, picking]);

    return gatherPassResources(resources, (resources: PassResources) =>
      use(DeferredRenderer, {resources, components, flags, children})
    );
  }

  return null;
}, 'Pass');

export const gatherPassResources = (
  children: LiveElement,
  then: (res: PassResources) => LiveElement,
) => {
  const reduceInPlace = (dst: PassResources, src: PassResources) => {
    for (const type in src) {
      const s = src[type];
      const d = dst[type];

      for (const k in s) d[k] = s[k];
    }
  };
  
  return gather(children, (els: PassResources[]) => {
    const out: PassResources = {
      buffers: {},
      bindings: {},
    };

    for (const el of els) reduceInPlace(out, el);
    return then(out);
  });
};
