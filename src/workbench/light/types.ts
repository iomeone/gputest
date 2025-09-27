import type { TypedArray } from '../../core';
import type { ShaderModule } from '../../shader';

export type Light = {
  kind: number,
  position?: TypedArray | number[],
  normal?: TypedArray | number[],
  tangent?: TypedArray | number[],
  size?: TypedArray | number[],
  color?: TypedArray | number[],
  intensity?: number,
  transform?: ShaderModule | null,
};