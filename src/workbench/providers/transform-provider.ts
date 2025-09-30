import type { ShaderModule } from '@use-gpu/shader';
import type { DataBounds } from '@use-gpu/core';
import type { RefObject } from '@use-gpu/live';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';
import { mat4, mat3 } from 'gl-matrix';

export type MatrixRefs = {
  matrix: RefObject<mat4>,
  normalMatrix: RefObject<mat3>,
};

export type MatrixState = {
  matrix: mat4,
  normalMatrix: mat3,
};

export type MatrixInstances = {
  use: () => (state: MatrixState) => number,
  instance: number,
};

export type TransformBounds = (bounds: DataBounds) => DataBounds;

export type TransformContextProps = {
  key: number,
  transform?: ShaderModule | null,
  differential?: ShaderModule | null,
  bounds?: TransformBounds | null,

  nonlinear?: TransformContextProps | null,
  matrix?: MatrixRefs | null,
};

export const DEFAULT_TRANSFORM = {
  key: 0,
  transform: null,
  differential: null,
  bounds: (b: DataBounds) => b,
};

export const TransformContext = makeContext<TransformContextProps>(DEFAULT_TRANSFORM, 'TransformContext');

export const useTransformContext = () => useContext(TransformContext);
export const useNoTransformContext = () => useNoContext(TransformContext);
