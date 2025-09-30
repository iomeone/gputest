import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { yeet, useMemo } from '@use-gpu/live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '@use-gpu/wgsl/instance/vertex/deferred-light.wgsl';
import { getDeferredEmissiveFragment } from '@use-gpu/wgsl/instance/fragment/deferred-emissive.wgsl';

import { FULLSCREEN_PIPELINE, FULLSCREEN_DEFS, useLightDraw } from './light';

export type EmissiveLightRenderProps = {
  gbuffer: TextureSource[],
  getLight: ShaderModule,
};

export const EmissiveLightRender: LiveComponent<EmissiveLightRenderProps> = (props: EmissiveLightRenderProps) => {
  const {
    gbuffer,
    getLight,
  } = props;

  const getVertex = useShader(getDeferredLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useShader(getDeferredEmissiveFragment, gbuffer);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, 1, 0, links, FULLSCREEN_PIPELINE));
}
