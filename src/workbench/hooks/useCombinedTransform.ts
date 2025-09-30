import type { Lazy, DataBounds } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { TransformContextProps } from '../providers/transform-provider';

import { useMemo, useNoMemo } from '@use-gpu/live';
import { chainTo, getBundleKey } from '@use-gpu/shader/wgsl';
import { useTransformContext, useNoTransformContext, TransformBounds } from '../providers/transform-provider';
import { getShader } from '../hooks/useShader';
import {
  useCombinedMatrix, useNoCombinedMatrix,
  useMatrixBounds, useNoMatrixBounds,
  useMatrixTransform, useNoMatrixTransform,
} from './useMatrixTransform';

import { getChainDifferential } from '@use-gpu/wgsl/transform/diff-chain.wgsl';
import { getEpsilonDifferential } from '@use-gpu/wgsl/transform/diff-epsilon.wgsl';
import { mat4 } from 'gl-matrix';

export const useCombinedTransform = (
  transform?: TransformContextProps | ShaderModule | null,
  differential?: ShaderModule | null,
  bounds?: TransformBounds | null,
) => {
  const parent = useTransformContext();

  return useMemo(() => {
    if (!transform) return parent;

    let key;
    if ('transform' in transform) ({key, transform, differential, bounds} = transform);

    const t = transform as ShaderModule;
    if (!key) key = getBundleKey(t) ^ (differential ? getBundleKey(differential) : 0);

    return chainTransform({key, transform: t, differential, bounds}, parent) as TransformContextProps;
  }, [parent, transform, differential, bounds]);
};

export const useCombinedEpsilonTransform = (
  transform: ShaderModule | null,
  epsilon: ShaderSource | Lazy<number> = 1e-3,
) => {
  const parent = useTransformContext();

  return useMemo(() => {
    if (!transform) return parent;

    const t = transform as ShaderModule;
    const k = getBundleKey(t);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const chained = chainTransform({key: k, transform}, parent)!;
    const differential = getShader(getEpsilonDifferential, [chained.transform, epsilon]);

    const key = k ^ getBundleKey(differential);
    return {...chained, key, differential};
  }, [parent, transform, epsilon]);
};

export const useCombinedMatrixTransform = (
  matrix?: mat4 | null,
): [TransformContextProps, mat4 | null] => {
  const parent = useTransformContext();
  const combined = useCombinedMatrix(matrix);
  if (!combined) {
    useNoMatrixBounds();
    useNoMatrixTransform();
    useNoMemo();
    return [parent, combined];
  }

  const bounds = useMatrixBounds(combined);
  const [props, refs] = useMatrixTransform(combined, bounds);

  const context = useMemo(() => {
    const prev = parent.nonlinear ?? parent;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const chained = chainTransform(props, prev)!;
    return {...chained, nonlinear: prev, matrix: refs};
  }, [props, parent]);

  return [context, combined];
};

export const useNoCombinedTransform = () => {
  useNoTransformContext();
  useNoMemo();
};

export const useNoCombinedEpsilonTransform = useNoCombinedTransform;

export const useNoCombinedMatrixTransform = () => {
  useNoTransformContext();
  useNoCombinedMatrix();
  useNoMatrixBounds();
  useNoMatrixTransform();
  useNoMemo();
};

export const chainTransform = (
  a: TransformContextProps | null,
  b: TransformContextProps | null,
): TransformContextProps | null => {
  if (a == null) return b;
  if (b == null) return a;

  const {
    transform: transformA,
    differential: differentialA,
    bounds: boundsA,
  } = a;

  const {
    transform: transformB,
    differential: differentialB,
    bounds: boundsB,
  } = b;

  if (transformA == null) return b;
  if (transformB == null) return a;

  const combinedPos  = chainTo(transformA, transformB);

  const combinedDiff = differentialA && differentialB
      ? getShader(getChainDifferential, [transformA, differentialA, differentialB])
      : null;

  const combinedBounds = boundsB && boundsA
    ? (b: DataBounds) => boundsB(boundsA(b))
    : null;

  return {
    key: getBundleKey(combinedPos),
    transform: combinedPos,
    differential: combinedDiff,
    bounds: combinedBounds,
  };
};
