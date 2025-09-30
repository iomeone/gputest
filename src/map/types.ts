import type { ColorLike, DataBounds, ViewUniforms } from '@use-gpu/core';
import { mat4 } from 'gl-matrix';

export type MVTStyleSheet = Record<string, MVTStyleProperties>;

export type MVTStyleProperties = {
  face: null | {
    stroke: ColorLike,
    fill: ColorLike,
    width: number,
    depth: number,
    zBias: number,
  },
  line: null | {
    color: ColorLike,
    width: number,
    depth: number,
    zBias: number,
  },
  point: null | {
    color: ColorLike,
    shape: any,
    hollow: boolean,
    size: number,
    depth: number,
    zBias: number,
  },
  font: null | {
    stroke: ColorLike,
    fill: ColorLike,
    outline: number,
    size: number,
    depth: number,
    zBias: number,

    family: string,
    style: string,
    weight: string | number,
    lineHeight: number,
  },
};

export type QuadTreeRoot<T> = {
  root: QuadTreeNode<T> | null,
  count: number,
};

export type QuadTreeNode<T> = {
  key: number,

  x: number,
  y: number,
  zoom: number,

  data: T,

  nodes: QuadTreeNodes<T>,
};

export type QuadTreeNodes<T> = (QuadTreeNode<T> | null)[] | null;

export type QuadTreeLODStrategy<T> = (
  uniforms: ViewUniforms,
  matrix: mat4 | null,
) => (
  node: QuadTreeNode<T>,
) => boolean | null;

export type QuadTreeKey = {
  x: number,
  y: number,
  zoom: number,
};

export type DistanceLODNode = {
  bounds: DataBounds,
};

