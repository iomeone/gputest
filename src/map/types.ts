import type { ColorLike } from '@use-gpu/core';

export type MVTStyleSheet = Record<string, MVTStyleProperties>;

export type MVTStyleProperties = {
  face: {
    stroke: ColorLike,
    fill: ColorLike,
    width: number,
    depth: number,
    zBias: any,
  },
  line: {
    color: ColorLike,
    width: number,
    depth: number,
    zBias: any,
  },
  point: {
    color: ColorLike,
    shape: any,
    hollow: boolean,
    size: number,
    depth: number,
    zBias: any,
  },
  font: {
    family: string,
    style: string,
    weight: string | number,
    lineHeight: number,
    size: number,
  },
};

