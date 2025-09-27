import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { GLTF } from './types';

import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { use, provide, useMemo } from '@use-gpu/live';
import { mat4 } from 'gl-matrix';

import { PBRMaterialProps, useBoundShader, useNativeColorTexture } from '@use-gpu/workbench';

export const useGLTFMaterial = (
  gltf: GLTF,
  material?: number,
) => {
  if (!gltf.bound) throw new Error("GLTF bound data is missing. Load GLTF using <GLTFData>.");
  if (material == null || !gltf.materials?.[material]) {
    useNativeColorTexture();
    useNativeColorTexture();
    useNativeColorTexture();
//    useNativeColorTexture();
    return {};
  }
  
  const {
    pbrMetallicRoughness,
    normalTexture,
    occlusionTexture,
    emissiveTexture,
    //emissiveFactor,
    //alphaMode,
    //alphaCutoff,
    //doubleSided,
  } = gltf.materials[material];

  const props: Partial<PBRMaterialProps> = {
    metalness: 0.0,
    roughness: 0.5,
  };

  if (pbrMetallicRoughness) {
    const {
      baseColorFactor,
      baseColorTexture,
      metallicFactor,
      roughnessFactor,
      metallicRoughnessTexture,
    } = pbrMetallicRoughness;

    if (baseColorTexture != null) {
      let map = gltf.bound.texture[baseColorTexture.index];
      if (map) {
        if (map.colorSpace === 'auto') map = {...map, colorSpace: 'srgb'};
        props.albedoMap = map;
      }
    }
    if (baseColorFactor != null) {
      props.albedo = baseColorFactor;
    }

    if (metallicFactor != null) {
      props.metalness = metallicFactor;
    }
    if (roughnessFactor != null) {
      props.roughness = roughnessFactor;
    }
    if (metallicRoughnessTexture != null) {
      let map = gltf.bound.texture[metallicRoughnessTexture.index];
      if (map) {
        if (map.colorSpace === 'auto') map = {...map, colorSpace: 'native'};
        props.metalnessRoughnessMap = map;
        if (metallicFactor == null) props.metalness = 1.0;
        if (roughnessFactor == null) props.roughness = 1.0;
      }
    }
    
    if (normalTexture != null) {
      let map = gltf.bound.texture[normalTexture.index];
      if (map) {
        if (map.colorSpace === 'auto') map = {...map, colorSpace: 'native'};
        props.normalMap = map;
      }
    }

    if (occlusionTexture != null) {
      let map = gltf.bound.texture[occlusionTexture.index];
      if (map) {
        if (map.colorSpace === 'auto') map = {...map, colorSpace: 'native'};
        props.occlusionMap = map;
      }
    }

    if (emissiveTexture != null) {
      let map = gltf.bound.texture[emissiveTexture.index];
      if (map) {
        if (map.colorSpace === 'auto') map = {...map, colorSpace: 'srgb'};
        props.emissiveMap = map;
      }
    }
  }
    
  props.albedoMap = useNativeColorTexture(props.albedoMap);
  props.normalMap = useNativeColorTexture(props.normalMap);
  props.occlusionMap = useNativeColorTexture(props.occlusionMap);
  props.emissiveMap = useNativeColorTexture(props.emissiveMap);

  return props;
};
