import type { GLTFSceneData, GLTFNodeData, GLTFMeshData, GLTFMaterialData, GLTFMaterialPBR } from './types';
import { mat4, vec3, vec4, quat } from 'gl-matrix';

export const toScene = <T = any>(t: any): GLTFSceneData<T> => {
  return {
    ...t,
    nodes: new Uint32Array(t.nodes),
  };
};

export const toNode = <T = any>(t: any): GLTFNodeData<T> => {
  return {
    ...t,
    children:    t.children    ? new Uint32Array(t.children)                : undefined,
    weights:     t.weights     ? new Float32Array(t.weights)                : undefined,
    matrix:      t.matrix      ? (mat4.fromValues as any)(...t.matrix)      : undefined,
    rotation:    t.rotation    ? (quat.fromValues as any)(...t.rotation)    : undefined,
    scale:       t.scale       ? (vec3.fromValues as any)(...t.scale)       : undefined,
    translation: t.translation ? (vec3.fromValues as any)(...t.translation) : undefined,
  };
};

export const toMesh = <T = any>(t: any): GLTFMeshData<T> => {
  return {
    ...t,
    weights: t.weights ? new Float32Array(t.weights) : undefined,
  };
};


export const toMaterial = <T = any>(t: any): GLTFMaterialData<T> => {
  return {
    ...t,
    pbrMetallicRoughness: t.pbrMetallicRoughness ? toPBR(t.pbrMetallicRoughness)                 : undefined,
    emissiveFactor:       t.emissiveFactor       ? (vec3.fromValues as any)(...t.emissiveFactor) : undefined,
  }
};

export const toPBR = <T = any>(t: any): GLTFMaterialPBR<T> => {
  return {
    ...t,
    baseColorFactor: t.baseColorFactor ? (vec4.fromValues as any)(...t.baseColorFactor) : undefined,
  }
};
