import type { LC, PropsWithChildren, LiveElement } from '../../../live';
import type { ShaderModule } from '../../../shader';
import type { LightEnv } from '../../pass/types';
import type { UseLight } from './light-data';

import { use, yeet, provide, fence, useMemo, useOne } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { LightContext } from '../../providers/light-provider';
import { LightData, SHADOW_PAGE } from './light-data';

import { getLight, getLightCount } from '../../../gen-wgsl/use/light';
import { sampleShadow } from '../../../gen-wgsl/use/shadow';

import { applyLight as applyLightWGSL } from '../../../gen-wgsl/material/light';
import { applyLights as applyLightsWGSL } from '../../../gen-wgsl/material/lights';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '../../../gen-wgsl/shadow/directional';
import { applyPointShadow as applyPointShadowWGSL } from '../../../gen-wgsl/shadow/point';

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
