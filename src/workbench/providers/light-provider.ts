import type { ShaderModule } from '../../shader';

import { useContext, useMemo, useOne, makeContext, makeCapture } from '../../live';
import { bindBundle } from '../../shader/wgsl';

import { applyLight as applyLightWGSL } from '../../wgsl/material/light.wgsl';
import { applyLights as applyLightsWGSL } from '../../wgsl/material/lights-default.wgsl';

type LightContextProps = {
  bindMaterial: (s: ShaderModule) => ShaderModule,
  useMaterial: (s: ShaderModule) => ShaderModule,
};

export const DEFAULT_LIGHT_CONTEXT = {
  bindMaterial: (applyMaterial: ShaderModule) => {
    const applyLight = bindBundle(applyLightWGSL, {applyMaterial});
    return bindBundle(applyLightsWGSL, {applyLight});
  },

  useMaterial: (applyMaterial: ShaderModule) =>
    useOne(() => DEFAULT_LIGHT_CONTEXT.bindMaterial(applyMaterial), applyMaterial),
};

export const LightContext = makeContext<LightContextProps>(DEFAULT_LIGHT_CONTEXT, 'LightContext');

export const useLightContext = () => useContext(LightContext);
