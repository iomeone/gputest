import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { patch, $set } from '@use-gpu/state';
import { provide, useMemo } from '@use-gpu/live';
import { bundleToAttribute, chainTo } from '@use-gpu/shader/wgsl';

import { EnvironmentContext } from '../providers/environment-provider';
import { MaterialContext, useMaterialContext } from '../providers/material-provider';

import { getSource } from '../hooks/useSource';
import { getShader, useShader, useNoShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { getDefaultEnvironment } from '@use-gpu/wgsl/material/lights-default-env.wgsl';
import { applyPBREnvironment } from '@use-gpu/wgsl/material/pbr-environment.wgsl';
import { gainColor } from '@use-gpu/wgsl/fragment/gain.wgsl';

import {
  SH_DIFFUSE  as SH_DIFFUSE_PARK,
  SH_SPECULAR as SH_SPECULAR_PARK,
} from '@use-gpu/wgsl/material/env/park.wgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_PISA,
  SH_SPECULAR as SH_SPECULAR_PISA,
} from '@use-gpu/wgsl/material/env/pisa.wgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_ROAD,
  SH_SPECULAR as SH_SPECULAR_ROAD,
} from '@use-gpu/wgsl/material/env/road.wgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_FIELD,
  SH_SPECULAR as SH_SPECULAR_FIELD,
} from '@use-gpu/wgsl/material/env/field.wgsl';

const ENV_ATTR = bundleToAttribute(getDefaultEnvironment);

const PRESETS = {
  'park':  [SH_DIFFUSE_PARK, SH_SPECULAR_PARK],
  'pisa':  [SH_DIFFUSE_PISA, SH_SPECULAR_PISA],
  'road':  [SH_DIFFUSE_ROAD, SH_SPECULAR_ROAD],
  'field': [SH_DIFFUSE_FIELD, SH_SPECULAR_FIELD],
} as Record<string, [ShaderModule, ShaderModule]>;

export type EnvironmentProps = PropsWithChildren<{
  map?: ShaderSource | null,
  preset?: (keyof typeof PRESETS) | 'none',
  gain?: number,
}>;

export const Environment: LC<EnvironmentProps> = (props: EnvironmentProps) => {
  const {map, preset, gain = 1, children} = props;

  const environment = map || !((preset as any) in PRESETS)
    ? (useNoShader(), map ?? null)
    : useShader(getDefaultEnvironment, [...PRESETS[preset as any] ?? PRESETS.park]);

  const g = useShaderRef(gain);

  const exposure = useMemo(() => {
    if (!environment) return environment;
    const env = getSource(ENV_ATTR, environment);
    return chainTo(env, getShader(gainColor, [g], {IS_OPAQUE: true}));
  }, [gain, environment, g]);

  const parent = useMaterialContext();
  const context = useMemo(() => {
    return patch(parent, {
      shaded: {
        applyEnvironment: $set(exposure ? getShader(applyPBREnvironment, [exposure]) : null as ShaderModule | null | undefined),
      },
    });
  }, [exposure, parent])

  return (
    provide(EnvironmentContext, exposure,
      provide(MaterialContext, context, children)
    )
  );
};
