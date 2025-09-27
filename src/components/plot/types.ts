import { TypedArray } from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/wgsl/types';

export type PropParser<A, B> = (t?: A) => B;
export type PropDef = Record<string, PropParser<A, B>>;

export type Swizzle = string;
export type Axis = 'x' | 'y' | 'z' | 'w';
export type Range = [number, number];
export type Join = 'miter' | 'round' | 'bevel';
export type Blending = 'none' | 'normal' | 'add' | 'subtract' | 'multiply' | 'custom';
export type Domain = 'linear' | 'log',
export type Color = [number, number, number, number];
export type Placement = 'center' | 'left' | 'top' | 'right' | 'bottom';
export type Flip = 'none' | 'outside' | 'inside';
export type PointShape = 'circle' | 'diamond' | 'square' | 'circleOutlined' | 'diamondOutlined' | 'squareOutlined';

export type ColorLike = number | VectorLike | {rgb: VectorLike} | {rgba: VectorLike} | string;
export type VectorLike = TypedArray | number[];
export type ArrayLike<T = any> = TypedArray | T[];

export type AxisTrait = {
  range: VectorLike,
  axis: Axis,
};

export type AxesTrait = {
  range: VectorLike[],
  axes: Swizzle,
};

export type ArrowTrait = {
  size: number,
  start: boolean,
  end: boolean,
};

export type ColorTrait = {
  color: Color,
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
  expr?: (v: number, i: number) => string,
  size: number,
  depth: number,
  outline: number,
  background: Color,
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

export type ROPTrait = {
  blending: Blending,
  zWrite: boolean,
  zTest: boolean,
  zBias: number,
  zIndex: number,
};

export type ScaleTrait = {
  mode: Domain,
  divide: number,
  unit: number,
  base: number,
  start: boolean,
  end: boolean,
  zero: boolean,
  factor: number,
  nice: boolean,
};
