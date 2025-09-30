import type { LiveComponent } from '../../../live';
import type { ShaderModule } from '../../../shader';

import { yeet, useMemo } from '../../../live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '../../../wgsl/instance/vertex/deferred-lightwgsl';
import { getDeferredEnvironmentFragment } from '../../../wgsl/instance/fragment/deferred-environmentwgsl';

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
