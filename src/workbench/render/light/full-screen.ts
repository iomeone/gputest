import type { LiveComponent } from '@use-gpu/live';
import type { LightKindProps } from './light';

import { yeet, useMemo } from '@use-gpu/live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '@use-gpu/wgsl/instance/vertex/deferred-light.wgsl';
import { getDeferredLightFragment } from '@use-gpu/wgsl/instance/fragment/deferred-light.wgsl';

import { FULLSCREEN_PIPELINE, FULLSCREEN_DEFS, useLightDraw } from './light';

export const FullScreenLightRender: LiveComponent<LightKindProps> = (props: LightKindProps) => {
  const {
    start,
    end,
    gbuffer,

    getLight,
    applyLight,
  } = props;

  const getVertex = useShader(getDeferredLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useShader(getDeferredLightFragment, [...gbuffer, getLight, applyLight]);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, end - start, start, links, FULLSCREEN_PIPELINE));
}
