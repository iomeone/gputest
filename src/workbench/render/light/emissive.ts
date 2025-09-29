import type { LiveComponent } from '../../../live';
import type { TextureSource } from '../../../core';
import type { ShaderModule } from '../../../shader';
import type { LightKindProps } from './light';

import { yeet, useMemo } from '../../../live';

import { useBoundShader } from '../../hooks/useBoundShader';

import { getLightVertex } from '../../../gen-wgsl/instance/vertex/light';
import { getEmissiveFragment } from '../../../gen-wgsl/instance/fragment/emissive';

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

  const getVertex = useBoundShader(getLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useBoundShader(getEmissiveFragment, gbuffer);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, 1, 0, links, FULLSCREEN_PIPELINE));
}
