import type { GLTFSceneData, GLTFNodeData, GLTFMeshData, GLTFMaterialData, GLTFMaterialPBR } from './types';
import { mat4, vec3, vec4, quat } from 'gl-matrix';

type Pointer = {offset: number};

const GLTF_MAGIC = 0x46546C67;

export const parseBinaryGLTF = (data: ArrayBuffer) => {
  const view = new DataView(data);

  const ptr = {offset: 0};

  const magic         = getUint32(view, ptr);
  const version       = getUint32(view, ptr);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const length        = getUint32(view, ptr);

  if (magic !== GLTF_MAGIC) return null;
  if (version !== 2) throw new Error(`Unsupported GLTF binary version '${version}'`);

  let json = {};
  let bin = null;

  let chunk;
  while ((chunk = getBinaryChunk(view, ptr)) != null) {
    const {type, data} = chunk;

    if (type === 0x4E4F534A) {
      ({json} = parseTextGLTF(data));
    }

    if (type === 0x004E4942) {
      bin = data;
    }
  }

  return {json, bin};
};

export const parseTextGLTF = (data: ArrayBuffer) => {
  const json = JSON.parse(new TextDecoder().decode(data));
  return {json};
};

export const getBinaryChunk = (view: DataView, ptr: Pointer) => {
  if (ptr.offset >= view.byteLength) return null;

  const length = getUint32(view, ptr);
  const type = getUint32(view, ptr);

  const {offset} = ptr;
  const data = view.buffer.slice(offset, offset + length);
  ptr.offset += length;

  return {length, type, data};
};

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

export const getUint32 = (view: DataView, ptr: Pointer): number => {
  const int = view.getUint32(ptr.offset, true);
  ptr.offset += 4;
  return int;
};

