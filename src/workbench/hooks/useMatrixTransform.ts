import type { DataBounds } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { TransformContextProps, TransformBounds, MatrixRefs } from '../providers/transform-provider';

import { useCallback, useDouble, useMemo, useOne, useVersion, useNoCallback, useNoDouble, useNoOne, useNoVersion } from '@use-gpu/live';
import { bundleToAttribute, getBundleKey } from '@use-gpu/shader/wgsl';
import { useMatrixContext, useNoMatrixContext } from '../providers/matrix-provider';
import { getShader } from './useShader';
import { getSource } from './useSource';

import { vec3, mat3, mat4 } from 'gl-matrix';

import { getCartesianPosition } from '@use-gpu/wgsl/transform/cartesian.wgsl';
import { getMatrixDifferential } from '@use-gpu/wgsl/transform/diff-matrix.wgsl';

const NO_MATRIX = mat4.create();
const MATRIX_BINDING = bundleToAttribute(getCartesianPosition, 'getTransformMatrix');

const makeMat4 = () => mat4.create();

export const useCombinedMatrix = (
  matrix?: mat4 | null,
): mat4 | null => {
  const parent = useMatrixContext();
  const version = useVersion(parent) + useVersion(matrix);
  const [swapMatrix] = useDouble(makeMat4);

  return useOne(
    () => {
      if (!matrix) return parent;
      return parent ? mat4.multiply(swapMatrix(), parent, matrix) : matrix;
    },
    version
  );
};

export const useNoCombinedMatrix = () => {
  useNoMatrixContext();
  useNoVersion();
  useNoVersion();
  useNoDouble();
  useNoOne();
};

export const useMatrixTransform = (
  matrix?: mat4 | null,
  bounds?: TransformBounds | null,
): [
  TransformContextProps,
  MatrixRefs,
] => {
  const refs: MatrixRefs = useOne(() => ({
    matrix: {current: matrix ?? NO_MATRIX},
    normalMatrix: {current: mat3.create()},
  }));

  useOne(() => {
    const m = matrix ?? NO_MATRIX;
    refs.matrix.current = m;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mat3.normalFromMat4(refs.normalMatrix.current!, m);
  }, matrix);

  return useOne(() => {
    const boundMatrix = getSource(MATRIX_BINDING, refs.matrix);

    const transform = getShader(getCartesianPosition, [boundMatrix]);
    const differential = getShader(getMatrixDifferential, [boundMatrix, refs.normalMatrix]);

    const key = getBundleKey(transform) ^ getBundleKey(differential);
    return [{key, transform, differential, bounds}, refs];
  });
};

export const useNoMatrixTransform = () => {
  useNoOne();
  useNoOne();
  useNoOne();
};

export const useMatrixTransformSources = (
  matrix?: ShaderSource,
  normalMatrix?: ShaderSource,
): TransformContextProps => {
  return useMemo(() => {
    const m = matrix ? getSource(MATRIX_BINDING, matrix) : null;
    const transform = getShader(getCartesianPosition, [m]);
    const differential = getShader(getMatrixDifferential, [m, normalMatrix]);

    const key = getBundleKey(transform) ^ getBundleKey(differential);
    return {key, transform, differential};
  }, [matrix, normalMatrix]);
};

export const useNoMatrixTransformSources = () => {
  useNoOne();
};

export const useMatrixBounds = (
  matrix: mat4,
): TransformBounds | null => {
  const refs = useOne(() => ({
    bounds: { center: vec3.create(), radius: 0, min: vec3.create(), max: vec3.create() } as DataBounds,
    matrix,
    scale3: vec3.create(),
    scale: 0,
  }));

  useOne(() => {
    const {scale3} = refs;
    mat4.getScaling(scale3, matrix);
    refs.matrix = matrix;
    refs.scale = Math.max(Math.abs(scale3[0]), Math.abs(scale3[1]), Math.abs(scale3[2]));
  }, matrix);

  const getBounds = useCallback((b: DataBounds) => {
    const {matrix, bounds, scale} = refs;
    vec3.transformMat4(bounds.center as any, b.center as any, matrix);
    bounds.radius = scale * b.radius;

    // Bounds checking is ephemeral so return same object every time
    return bounds;
  });

  return getBounds;
}

export const useNoMatrixBounds = () => {
  useNoOne();
  useNoOne();
  useNoCallback();
};
