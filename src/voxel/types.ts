import type { StorageSource, TextureSource } from '@use-gpu/core';

export type VoxFile = {
  shapes: VoxShape[],
  palette: Uint32Array,
  pbr: Float32Array,

  nodes: VoxNodeInfo[],
  materials: VoxMeta[],
  layers: VoxMeta[],
  cameras: VoxMeta[],
  objects: VoxProps[],
};

export type Vox = VoxFile & {
  bound: {
    shapes: TextureSource[][],
    palette: TextureSource,
    pbr: StorageSource,
  },
};

export type VoxOptions = {
  mip: number,
  nodes: boolean,
  layers: boolean,
  materials: boolean,
  objects: boolean,
  cameras: boolean,
};

export type VoxShape = {
  size: [number, number, number],
  data: Uint8Array,
};

export type VoxProps = Record<string, string>;

export type VoxMeta = {
  id: number,
  props: VoxProps,
};

export type VoxNodeInfo = VoxNodeGroup | VoxNodeTransform | VoxNodeShape;

export type VoxNodeGroup = VoxMeta & {
  type: 'group',
  children: number[],
};

export type VoxNodeTransform = VoxMeta & {
  type: 'transform',
  child: number,
  layer: number,
  frame: Float32Array,
  frames?: Float32Array[],
};

export type VoxNodeShape = VoxMeta & {
  type: 'shape',
  model: VoxMeta,
  models?: VoxMeta[],
};

export type RawVox = {
  version: number,
  chunks: RawChunk[],
};

export type RawChunk = {
  id: string,
  base: number,
  length: number,
  children?: RawChunk[],
};
