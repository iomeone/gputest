import type { LC, PropsWithChildren } from '../../live';
import type { ShaderModule, ShaderSource } from '../../shader';

import { patch, $set } from '../../state';
import { provide, useMemo } from '../../live';
import { bundleToAttribute, chainTo } from '../../shader/wgsl';

import { EnvironmentContext } from '../providers/environment-provider';
import { MaterialContext, useMaterialContext } from '../providers/material-provider';

import { getSource } from '../hooks/useSource';
import { getShader, useShader, useNoShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { getDefaultEnvironment } from '../../wgsl/material/lights-default-envwgsl';
import { applyPBREnvironment } from '../../wgsl/material/pbr-environmentwgsl';
import { gainColor } from '../../wgsl/fragment/gainwgsl';

import {
  SH_DIFFUSE  as SH_DIFFUSE_PARK,
  SH_SPECULAR as SH_SPECULAR_PARK,
} from '../../wgsl/material/env/parkwgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_PISA,
  SH_SPECULAR as SH_SPECULAR_PISA,
} from '../../wgsl/material/env/pisawgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_ROAD,
  SH_SPECULAR as SH_SPECULAR_ROAD,
} from '../../wgsl/material/env/roadwgsl';
import {
  SH_DIFFUSE  as SH_DIFFUSE_FIELD,
  SH_SPECULAR as SH_SPECULAR_FIELD,
} from '../../wgsl/material/env/fieldwgsl';

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

  const adjusted = useMemo(() => {
    if (!environment) return environment;
    const env = getSource(ENV_ATTR, environment);
    return chainTo(env, getShader(gainColor, [g], {IS_OPAQUE: true}));
  }, [environment, g]);

  const parent = useMaterialContext();
  const context = useMemo(() => {
    return patch(parent, {
      shaded: {
        applyEnvironment: $set(adjusted ? getShader(applyPBREnvironment, [adjusted]) : null as ShaderModule | null | undefined),
      },
    });
  }, [adjusted, parent])

  return (
    provide(EnvironmentContext, adjusted,
      provide(MaterialContext, context, children)
    )
  );
};
