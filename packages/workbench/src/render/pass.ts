import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { PassFlags, RenderComponents } from '../pass/types';

import { use, gather, memo, useOne } from '@use-gpu/live';
import { toMurmur53 } from '@use-gpu/state';

import { FullScreenRenderer } from './full-screen-renderer';
import { ForwardRenderer } from './forward-renderer';
import { DeferredRenderer } from './deferred-renderer';

import { GBuffer } from './buffer/g-buffer';
import { LightBuffer } from './buffer/light-buffer';
import { MotionBuffer } from './buffer/motion-buffer';
import { NormalBuffer } from './buffer/normal-buffer';
import { OverscanBuffer } from './buffer/overscan-buffer';
import { PickingBuffer } from './buffer/picking-buffer';
import { ShadowBuffer } from './buffer/shadow-buffer';
import { SSAOBuffer } from './buffer/ssao-buffer';
import { ViewBuffer, useViewBuffer, useNoViewBuffer } from './buffer/view-buffer';

import { PassResources } from '../pass/types';

export type PassProps = PropsWithChildren<{
  mode?: 'forward' | 'deferred' | 'fullscreen',
  components?: RenderComponents,
  
  debug?: string,
  debugIndex?: number,
} & PassFlags>;

export const Pass: LC<PassProps> = memo((props: PassProps) => {
  const {
    mode = 'forward',

    lights = false,
    shadows = false,
    picking = false,
    ssao = false,

    overscan = 0,

    overlay = false,
    merge = false,

    debug,
    debugIndex,

    components,
    children,
  } = props;

  const options = {
    lights,
    shadows,
    picking,
    ssao,
    overscan,

    overlay,
    merge,

    debug,
    debugIndex,
  };

  const optionsKey = toMurmur53(options);

  if (mode === 'fullscreen') {
    const resources = useViewBuffer();
    return use(FullScreenRenderer, {
      resources,
      options,
      children,
    });
  }
  if (mode === 'forward') {
    useNoViewBuffer();

    const resources = useOne(() => [
      !(overscan as any)?.all ? use(ViewBuffer, options) : null,
      lights ? use(LightBuffer, options) : null,
      shadows ? use(ShadowBuffer, options) : null,
      picking ? use(PickingBuffer, options) : null,
      overscan ? use(OverscanBuffer, options) : null,
      ...(ssao ? [
        use(NormalBuffer, options),
        use(MotionBuffer, options),
      ] : []),
      ssao ? use(SSAOBuffer, options) : null,
    ], optionsKey);

    return gatherPassResources(resources, (resources: PassResources) =>
      use(ForwardRenderer, {resources, components, options, children})
    );
  }
  if (mode === 'deferred') {
    useNoViewBuffer();

    const resources = useOne(() => [
      use(GBuffer, options),
      use(ViewBuffer, options),
      lights ? use(LightBuffer, options) : null,
      // ssao ? use(SSAOBuffer, options) : null,
      shadows ? use(ShadowBuffer, options) : null,
      picking ? use(PickingBuffer, options) : null,
    ], optionsKey);

    return gatherPassResources(resources, (resources: PassResources) =>
      use(DeferredRenderer, {resources, components, options, children})
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
      const s = (src as any)[type];
      const d = (dst as any)[type];

      if (Array.isArray(d)) {
        if (Array.isArray(s)) for (const v of s) d.push(v);
        else d.push(s);
      }
      else for (const k in s) d[k] = s[k];
    }
  };
  
  return gather(children, (els: PassResources[]) => {
    const out: PassResources = {
      buffers: {},
      bindings: {},
      dispatches: [],
      views: {},
    };

    for (const el of els) reduceInPlace(out, el);
    return then(out);
  });
};
