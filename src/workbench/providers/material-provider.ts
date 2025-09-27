import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Point4 } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { ColorLike } from '@use-gpu/traits';

import { provide, useOne } from '@use-gpu/live';
import { parseColor, useProp } from '@use-gpu/traits';
import { makeContext, useContext } from '@use-gpu/live';
import { bindBundle, bundleToAttributes } from '@use-gpu/shader/wgsl';

import { useBoundShader } from '../hooks/useBoundShader';
import { useShaderRef } from '../hooks/useShaderRef';
import { useLightContext, DEFAULT_LIGHT_CONTEXT } from '../providers/light-provider';

import { getShadedFragment } from '@use-gpu/wgsl/instance/fragment/shaded.wgsl';
import { getMappedFragment } from '@use-gpu/wgsl/instance/fragment/mapped.wgsl';
import { getPBRMaterial } from '@use-gpu/wgsl/material/pbr-material.wgsl';
import { getDefaultPBRMaterial } from '@use-gpu/wgsl/material/pbr-default.wgsl';
import { applyPBRMaterial } from '@use-gpu/wgsl/material/pbr-apply.wgsl';

// Default PBR shader with built-in light
const applyLights = DEFAULT_LIGHT_CONTEXT.bindMaterial(applyPBRMaterial);
const shadedFragment = bindBundle(getShadedFragment, {
  getMaterial: getDefaultPBRMaterial,
  applyLights,
});

export const MaterialContext = makeContext<ShaderModule>(shadedFragment, 'MaterialContext');

export const useMaterialContext = () => useContext(MaterialContext);

const PBR_BINDINGS = bundleToAttributes(getPBRMaterial);
const MAPPED_BINDINGS = bundleToAttributes(getMappedFragment);
const SHADED_BINDINGS = bundleToAttributes(getShadedFragment);

export type MaterialProps = {
  getMaterial: ShaderModule,
  applyMaterial: ShaderModule,
};

export type PBRMaterialProps = {
  albedo?: ColorLike,
  metalness?: number,
  roughness?: number,

  albedoMap?: ShaderSource,
  metalnessMap?: ShaderSource,
  roughnessMap?: ShaderSource,

  metalnessRoughnessMap?: ShaderSource,
  
  normalMap?: ShaderSource,
  occlusionMap?: ShaderSource,
  emissiveMap?: ShaderSource,
};

const WHITE = [1, 1, 1, 1] as Point4;

export const PBRMaterial: LC<PBRMaterialProps> = (props: PropsWithChildren<PBRMaterialProps>) => {
  const {
    // albedo
    metalness = 0.0,
    roughness = 0.5,

    albedoMap,
    metalnessMap,
    roughnessMap,
    metalnessRoughnessMap,

    normalMap,
    occlusionMap,
    emissiveMap,

    children,
  } = props;

  const albedo = useProp(props.albedo, parseColor, WHITE);

  const a = useShaderRef(albedo, albedoMap);
  const m = useShaderRef(metalness, metalnessMap);
  const r = useShaderRef(roughness, roughnessMap);

  const mr = useShaderRef(null, metalnessRoughnessMap);

  const {useMaterial} = useLightContext();

  const getMaterial = useBoundShader(getPBRMaterial, PBR_BINDINGS, [a, m, r, mr]);
  const applyLights = useMaterial(applyPBRMaterial);

  let getFragment: ShaderModule;
  if (normalMap || occlusionMap || emissiveMap) {
    getFragment = useBoundShader(getMappedFragment, MAPPED_BINDINGS, [getMaterial, applyLights, normalMap, occlusionMap, emissiveMap]);
  }
  else {
    getFragment = useBoundShader(getShadedFragment, SHADED_BINDINGS, [getMaterial, applyLights]);
  }

  return provide(MaterialContext, getFragment, children);
}
