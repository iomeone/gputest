import type { ShaderModule } from '@use-gpu/shader';
import type { DataBounds } from '@use-gpu/core';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';
import { vec4 } from 'gl-matrix';

export type TransformContextProps = {
  transform: ShaderModule | null,
  differential: ShaderModule | null,
  bounds: (bounds: DataBounds) => DataBounds,
};

export const DEFAULT_TRANSFORM = {transform: null, differential: null, bounds: (b: DataBounds) => b};

export const TransformContext = makeContext<TransformContextProps>(DEFAULT_TRANSFORM, 'TransformContext');

export const useTransformContext = () => useContext(TransformContext);
export const useNoTransformContext = () => useNoContext(TransformContext);
