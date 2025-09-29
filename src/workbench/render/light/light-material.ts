import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { LightEnv } from '../../pass/types';
import type { UseLight } from './light-data';

import { use, yeet, provide, fence, useMemo, useOne } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { LightContext } from '../../providers/light-provider';
import { LightData, SHADOW_PAGE } from './light-data';

import { getLight, getLightCount } from '@use-gpu/wgsl/use/light.wgsl';
import { sampleShadow } from '@use-gpu/wgsl/use/shadow.wgsl';

import { applyLight as applyLightWGSL } from '@use-gpu/wgsl/material/light.wgsl';
import { applyLights as applyLightsWGSL } from '@use-gpu/wgsl/material/lights.wgsl';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '@use-gpu/wgsl/shadow/directional.wgsl';
import { applyPointShadow as applyPointShadowWGSL } from '@use-gpu/wgsl/shadow/point.wgsl';

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
