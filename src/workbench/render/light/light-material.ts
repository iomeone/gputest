import type { LC, PropsWithChildren, LiveElement } from '../../../live';
import type { ShaderModule } from '../../../shader';
import type { LightEnv } from '../../pass/types';
import type { UseLight } from './light-data';

import { use, yeet, provide, fence, useMemo, useOne } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { LightContext } from '../../providers/light-provider';
import { LightData, SHADOW_PAGE } from './light-data';

import { getLight, getLightCount } from '../../../wgsl/use/light.wgsl';
import { sampleShadow } from '../../../wgsl/use/shadow.wgsl';

import { applyLight as applyLightWGSL } from '../../../wgsl/material/light.wgsl';
import { applyLights as applyLightsWGSL } from '../../../wgsl/material/lights.wgsl';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '../../../wgsl/shadow/directional.wgsl';
import { applyPointShadow as applyPointShadowWGSL } from '../../../wgsl/shadow/point.wgsl';

export type LightMaterialProps = {
  shadows?: boolean,
  then?: (light: LightEnv) => LiveElement,
};

export const LightMaterial: LC<LightMaterialProps> = (props: PropsWithChildren<LightMaterialProps>) => {
  const {
    shadows,
    children,
    then,
  } = props;

  // Provide forward-lit material
  return use(LightData, {
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

      // Fence so that lights are never suspended
      return (
        provide(LightContext, context,
          fence(children, (v: any) => yeet(v))
        )
      );
    },
    then,
  });
};
