import type { LC, PropsWithChildren, LiveElement } from '../../../live';
import type { ShaderModule } from '../../../shader';
import type { LightEnv } from '../../pass/types';
import type { UseLight } from './light-data';

import { use, provide, useMemo } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { LightContext } from '../../providers/light-provider';
import { LightData, SHADOW_PAGE } from './light-data';

import { getLight, getLightCount } from '../../../wgsl/use/lightwgsl';
import { sampleShadow } from '../../../wgsl/use/shadowwgsl';

import { applyLight as applyLightWGSL } from '../../../wgsl/material/lightwgsl';
import { applyLights as applyLightsWGSL } from '../../../wgsl/material/lightswgsl';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '../../../wgsl/shadow/directionalwgsl';
import { applyPointShadow as applyPointShadowWGSL } from '../../../wgsl/shadow/pointwgsl';

export type LightMaterialProps = PropsWithChildren<{
  shadows?: boolean,
  then?: (light: LightEnv) => LiveElement,
}>;

export const LightMaterial: LC<LightMaterialProps> = (props: LightMaterialProps) => {
  const {
    shadows,
    children,
    then,
  } = props;

  // Provide forward-lit material
  return use(LightData, {
    shadows,
    render: (
      useLight: UseLight,
    ) => {
      const context = useMemo(() => {
        const bindMaterial = (applyMaterial: ShaderModule) => {

          const applyDirectionalShadow = shadows ? bindBundle(applyDirectionalShadowWGSL, {sampleShadow}) : null;
          const applyPointShadow = shadows ? bindBundle(applyPointShadowWGSL, {sampleShadow}) : null;

          const applyLight = bindBundle(applyLightWGSL, {
            applyMaterial,
            applyDirectionalShadow,
            applyPointShadow,
          }, {SHADOW_PAGE});

          return bindBundle(applyLightsWGSL, {applyLight, getLightCount, getLight});
        };

        const useMaterial = (applyMaterial: ShaderModule) =>
          useMemo(() => bindMaterial(applyMaterial), [bindMaterial, applyMaterial]);

        return {useLight, useMaterial};
      }, [useLight, shadows]);

      return (
        provide(LightContext, context, children)
      );
    },
    then,
  });
};
