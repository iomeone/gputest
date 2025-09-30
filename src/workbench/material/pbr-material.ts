import type { LC, LiveElement } from '@use-gpu/live';
import type { ColorLike, VectorLike, Lazy, XYZW } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { useProp } from '@use-gpu/traits/live';
import { parseColor } from '@use-gpu/parse';

import { useShader, useNoShader } from '../hooks/useShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { useEnvironmentContext } from '../providers/environment-provider';
import { useShaderRef } from '../hooks/useShaderRef';

import { getPBRMaterial } from '@use-gpu/wgsl/material/pbr-material.wgsl';
import { applyPBRMaterial } from '@use-gpu/wgsl/material/pbr-apply.wgsl';
import { applyPBREnvironment } from '@use-gpu/wgsl/material/pbr-environment.wgsl';

import { getMaterialSurface } from '@use-gpu/wgsl/instance/surface/material.wgsl';
import { getNormalMapSurface } from '@use-gpu/wgsl/instance/surface/normal-map.wgsl';
import { getBasicMaterial } from '@use-gpu/wgsl/material/basic-material.wgsl';

import { ShaderLitMaterial } from './shader-lit-material';

export type PBRMaterialProps = {
  albedo?: ColorLike,
  metalness?: Lazy<number>,
  roughness?: Lazy<number>,
  emissive?: VectorLike,

  albedoMap?: ShaderSource,
  metalnessRoughnessMap?: ShaderSource,
  emissiveMap?: ShaderSource,
  occlusionMap?: ShaderSource,
  normalMap?: ShaderSource,

  render?: (material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement,
  children?: LiveElement | ((material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement),
};

const WHITE = [1, 1, 1, 1] as XYZW;
const BLACK = [0, 0, 0, 0] as XYZW;

export const PBRMaterial: LC<PBRMaterialProps> = (props: PBRMaterialProps) => {
  const {
    //albedo,
    metalness,
    roughness,
    emissive,

    albedoMap,
    emissiveMap,
    occlusionMap,
    metalnessRoughnessMap,
    normalMap,

    render,
    children,
  } = props;

  const albedo = useProp(props.albedo, parseColor, WHITE);

  const a = useShaderRef(albedo);
  const e = useShaderRef(emissive  ?? (emissiveMap ? WHITE : BLACK));
  const m = useShaderRef(metalness ?? (metalnessRoughnessMap ? 1 : 0.0));
  const r = useShaderRef(roughness ?? (metalnessRoughnessMap ? 1 : 0.5));

  const t = useNativeColorTexture(albedoMap);

  const am  = useShaderRef(null, t);
  const em  = useShaderRef(null, emissiveMap);
  const om  = useShaderRef(null, occlusionMap);
  const mrm = useShaderRef(null, metalnessRoughnessMap);

  const defines = useMemo(() => ({
    HAS_ALBEDO_MAP: !!albedoMap,
    HAS_COLOR_MAP: !!albedoMap,
    HAS_EMISSIVE_MAP: !!emissiveMap,
    HAS_OCCLUSION_MAP: !!occlusionMap,
    HAS_METALNESS_ROUGHNESS_MAP: !!metalnessRoughnessMap,
  }), [albedoMap, emissiveMap, occlusionMap, metalnessRoughnessMap]);

  const getMaterial = useShader(getPBRMaterial, [
    a, e, m, r,
    am, em, om, mrm,
  ], defines);

  const boundSurface = useShader(getMaterialSurface, [getMaterial]);

  let getSurface = boundSurface;
  if (normalMap) getSurface = useShader(getNormalMapSurface, [boundSurface, normalMap]);
  else useNoShader();

  const environmentMap = useEnvironmentContext();
  const getEnvironment = environmentMap
    ? useShader(applyPBREnvironment, [environmentMap])
    : (useNoShader(), undefined);

  const getFragment = useShader(getBasicMaterial, [albedo, albedoMap], defines);

  return ShaderLitMaterial({
    fragment: getFragment,
    surface: getSurface,
    environment: getEnvironment,
    apply: applyPBRMaterial,
    render,
    children,
  });
}
