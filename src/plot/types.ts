import type { VectorLike, ColorLike, Placement, Blending, Domain, Join } from '@use-gpu/traits';
import type { PointShape } from '@use-gpu/workbench';

export type Axis4 = 'x' | 'y' | 'z' | 'w';
export type Swizzle = string;

export type AnchorTrait = {
  placement: Placement,
  offset: number,
};

export type AxisTrait = {
  range: VectorLike,
  axis: Axis4,
};

export type AxesTrait = {
  range: VectorLike[],
  axes: Swizzle,
};

export type ArrowTrait = {
  size: number,
  start: boolean,
  end: boolean,
  detail: number,
};

export type ColorTrait = {
  color: ColorLike,
  opacity: number,
};

export type FontTrait = {
  family: string,
  weight: string | number,
  style: string,
};

export type GridTrait = {
  range?: VectorLike[],
  axes: Swizzle,
};

export type LabelTrait = {
  labels?: string[],
  format?: (v: number, i: number) => string,
  size: number,
  depth: number,
  expand: number,
  background: ColorLike,
  box: number | [number, number],
};

export type LineTrait = {
  width: number,
  depth: number,
  join: Join,
  loop: boolean,
  dash: number[] | null,
  proximity: number,
};

export type ObjectTrait = {
  position: VectorLike,
  scale: VectorLike,
  quaternion: VectorLike,
  rotation: VectorLike,
  matrix: VectorLike,
};

export type PointTrait = {
  size: number,
  depth: number,
  shape: PointShape,
};

export type ROPTrait = {
  blending: Blending,
  zWrite: boolean,
  zTest: boolean,
  zBias: number,
  zIndex: number,
};

export type ScaleTrait = DomainOptions & {
  mode: Domain,
};

export type DomainOptions = {
  divide: number,
  unit: number,
  base: number,
  start: boolean,
  end: boolean,
  zero: boolean,
  factor: number,
  nice: boolean,
};

export type SurfaceTrait = {
  loopX: boolean,
  loopY: boolean,
  shaded: boolean,
};

export type VolumeTrait = {
  loopX: boolean,
  loopY: boolean,
  loopZ: boolean,
  shaded: boolean,
};
