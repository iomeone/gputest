import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { yeet, useMemo } from '@use-gpu/live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '@use-gpu/wgsl/instance/vertex/deferred-light.wgsl';
import { getDeferredEmissiveFragment } from '@use-gpu/wgsl/instance/fragment/deferred-emissive.wgsl';

import { FULLSCREEN_PIPELINE, FULLSCREEN_DEFS, useLightDraw } from './light-render';

export type EmissiveLightRenderProps = {
  gBuffer: TextureSource[],
  getLight: ShaderModule,
};

export const EmissiveLightRender: LiveComponent<EmissiveLightRenderProps> = (props: EmissiveLightRenderProps) => {
  const {
    gBuffer,
    getLight,
  } = props;

  const getVertex = useShader(getDeferredLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useShader(getDeferredEmissiveFragment, [gBuffer[3]]);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, 1, 0, links, FULLSCREEN_PIPELINE));
}
