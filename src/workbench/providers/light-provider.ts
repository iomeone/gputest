import type { ShaderModule } from '../../shader';
import type { Light } from '../light/types';

import { useContext, useOne, makeContext } from '../../live';
import { bindBundle } from '../../shader/wgsl';

import { applyLight as applyLightWGSL } from '../../wgsl/material/lightwgsl';
import { applyLights as applyLightsWGSL } from '../../wgsl/material/lights-defaultwgsl';

export type LightContextProps = {
  useLight: (l: Light) => void,
  bindApplyMaterial: (s: ShaderModule) => ShaderModule,
  useApplyMaterial: (s: ShaderModule) => ShaderModule,
};

export const DEFAULT_LIGHT_CONTEXT = {
  useLight: () => {
    console.warn('Light used in a pass without lights enabled.');
  },

  bindApplyMaterial: (applyMaterial: ShaderModule) => {
    const applyLight = bindBundle(applyLightWGSL, {applyMaterial});
    return bindBundle(applyLightsWGSL, {applyLight});
  },

  useApplyMaterial: (applyMaterial: ShaderModule) =>
    useOne(() => DEFAULT_LIGHT_CONTEXT.bindApplyMaterial(applyMaterial), applyMaterial),
};

export const LightContext = makeContext<LightContextProps>(DEFAULT_LIGHT_CONTEXT, 'LightContext');

export const useLightContext = () => useContext(LightContext);
