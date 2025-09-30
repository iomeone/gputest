import type { ViewUniforms } from '../../core';
import type { DistanceLODNode, QuadTreeNode } from '../types';

import { mat4, vec3 } from 'gl-matrix';

export type DistanceLODOptions = {
  minLevel: number,
  maxLevel: number,
  tile: number,
  detail: number,
};

export const distanceLODStrategy = <T extends DistanceLODNode>(options: Partial<DistanceLODOptions>) => {
  const {
    minLevel = 0,
    maxLevel = 8,
    tile = 128,
    detail = 1,
  } = options;

  const v1 = vec3.create();
  const v2 = vec3.create();

  return (
    uniforms: ViewUniforms,
    matrix: mat4 | null,
  ) => {
    let scale = 1;
    if (matrix) {
      mat4.getScaling(v2, matrix);
      scale = 1 / vec3.length(v2);
    }
  
    return (
      node: QuadTreeNode<T>,
    ) => {
      const {zoom, data: {bounds}} = node;
      const {center, radius} = bounds;

      const {viewPosition, viewWorldScale} = uniforms;
      const {current: vp} = viewPosition;
      const {current: vws} = viewWorldScale;

      const worldUnit = radius * detail / tile;

      if (matrix) vec3.transformMat4(v1, center as vec3, matrix);
      else vec3.copy(v1, center as vec3);
      vec3.sub(v1, vp as vec3, v1);

      const r = radius * scale;

      const viewDistance = Math.max(0, vec3.length(v1) - r);
      const ratio = viewDistance != 0 ? (worldUnit / viewDistance / vws[0]) : Infinity;

      return zoom < minLevel || (zoom < maxLevel && ratio > 1);
    };
  };
};
