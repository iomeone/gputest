import type { TypedArray } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

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