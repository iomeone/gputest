import type { ShaderModule } from '@use-gpu/shader';

import { useContext, useMemo, useOne, makeContext, makeCapture } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { applyLight as applyLightWGSL } from '@use-gpu/wgsl/material/light.wgsl';
import { applyLights as applyLightsWGSL } from '@use-gpu/wgsl/material/lights-default.wgsl';

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
