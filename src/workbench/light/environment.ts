import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { patch, $set } from '@use-gpu/state';
import { provide, useMemo } from '@use-gpu/live';

import { EnvironmentContext } from '../providers/environment-provider';
import { MaterialContext, useMaterialContext } from '../providers/material-provider';

import { getShader, useShader, useNoShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { getDefaultEnvironment } from '@use-gpu/wgsl/material/lights-default-env.wgsl';
import { applyPBREnvironment } from '@use-gpu/wgsl/material/pbr-environment.wgsl';

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

  const parent = useMaterialContext();
  const context = useMemo(() => {
    return patch(parent, {
      shaded: {
        applyEnvironment: $set(getShader(applyPBREnvironment, [environment, g]) as ShaderModule | null | undefined),
      },
    });
  }, [environment, parent])

  return (
    provide(EnvironmentContext, environment,
      provide(MaterialContext, context, children)
    )
  );
};
