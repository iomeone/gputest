import type { LiveComponent } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';

import { yeet, useMemo } from '@use-gpu/live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '@use-gpu/wgsl/instance/vertex/deferred-light.wgsl';
import { getDeferredEnvironmentFragment } from '@use-gpu/wgsl/instance/fragment/deferred-environment.wgsl';

import { FULLSCREEN_PIPELINE, FULLSCREEN_DEFS, useLightDraw } from './light-render';

export type EnvironmentLightRenderProps = {
  getSurface: ShaderModule,
  getLight: ShaderModule,

  environment: ShaderModule,
  apply: ShaderModule,
};

export const EnvironmentLightRender: LiveComponent<EnvironmentLightRenderProps> = (props: EnvironmentLightRenderProps) => {
  const {
    getSurface,
    getLight,
    environment,
    apply,
  } = props;

  const applyEnvironment = useShader(apply, [environment]);
  const getVertex = useShader(getDeferredLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useShader(getDeferredEnvironmentFragment, [getSurface, applyEnvironment]);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, 1, 0, links, FULLSCREEN_PIPELINE));
}
