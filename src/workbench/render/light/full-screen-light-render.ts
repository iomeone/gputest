import type { LiveComponent } from '../../../live';
import type { LightKindProps } from './light-render';

import { yeet, useMemo } from '../../../live';

import { useShader } from '../../hooks/useShader';

import { getDeferredLightVertex } from '../../../wgsl/instance/vertex/deferred-lightwgsl';
import { getDeferredLightFragment } from '../../../wgsl/instance/fragment/deferred-lightwgsl';

import { FULLSCREEN_PIPELINE, FULLSCREEN_DEFS, useLightDraw } from './light-render';

export const FullScreenLightRender: LiveComponent<LightKindProps> = (props: LightKindProps) => {
  const {
    start,
    end,

    getSurface,
    getLight,
    applyLight,
  } = props;

  const getVertex = useShader(getDeferredLightVertex, [getLight], FULLSCREEN_DEFS);
  const getFragment = useShader(getDeferredLightFragment, [getSurface, getLight, applyLight]);

  const links = useMemo(() => ({getVertex, getFragment}), [getVertex, getFragment]);

  return yeet(useLightDraw(3, end - start, start, links, FULLSCREEN_PIPELINE));
}
