import type { VectorLike, ColorLike, Placement, Blending, Domain, Join } from '@use-gpu/traits';
import type { PointShape } from '@use-gpu/workbench';

export type GeographicTrait = {
  long: number,
  lat: number,
  zoom: number,
};

export type ObjectTrait = {
  position: VectorLike,
  scale: VectorLike,
  quaternion: VectorLike,
  rotation: VectorLike,
  matrix: VectorLike,
};

export type MVTStyleSheet = Record<string, MVTStyleProperties>;

export type MVTStyleProperties = {
  face: {
    stroke?: ColorLike,
    fill?: ColorLike,
    width?: number,
    depth?: number,
    zBias?: any,
  },
  line: {
    color?: ColorLike,
    width?: number,
    depth?: number,
    zBias?: any,
  },
  point?: {
    color?: ColorLike,
    shape?: any,
    size?: number,
    depth?: number,
    zBias?: any,
  },
  font?: {
    family?: string,
    style?: string,
    weight?: string | number,
    lineHeight?: number,
    size?: number,
  },  
};

