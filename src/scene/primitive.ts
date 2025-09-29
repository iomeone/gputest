import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { DataBounds } from '@use-gpu/core';

import { memo, provide, useCallback, useOne } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { vec3, mat3, mat4 } from 'gl-matrix';

import {
  TransformContext, useMatrixContext,
  useShaderRef, useBoundShader, useBoundSource, useCombinedTransform,
 } from '@use-gpu/workbench';

import { getCartesianPosition } from '@use-gpu/wgsl/transform/cartesian.wgsl';
import { getMatrixDifferential } from '@use-gpu/wgsl/transform/diff-matrix.wgsl';

const MATRIX_BINDINGS = bundleToAttributes(getCartesianPosition);

export type PrimitiveProps = {
  _?: number,
};

export const Primitive: LiveComponent<PrimitiveProps> = memo((props: PropsWithChildren<PrimitiveProps>) => {
  const {children} = props;

  const matrix = useMatrixContext();
  if (!matrix) return children;

  const [normalMatrix, matrixScale] = useOne(() => {
    const normalMatrix = mat3.normalFromMat4(mat3.create(), matrix);

    const s = mat4.getScaling(vec3.create(), matrix);
    const matrixScale = Math.max(Math.abs(s[0]), Math.abs(s[1]), Math.abs(s[2]));

    return [normalMatrix, matrixScale];
  }, matrix);

  const matrixRef = useShaderRef(matrix);
  const normalMatrixRef = useShaderRef(normalMatrix);
  const matrixScaleRef = useShaderRef(matrixScale);

  const boundMatrix = useBoundSource(MATRIX_BINDINGS[0], matrixRef);
  const boundPosition = useBoundShader(getCartesianPosition, [boundMatrix]);
  const boundDifferential = useBoundShader(getMatrixDifferential, [boundMatrix, normalMatrixRef]);

  const cullBounds = useOne(() => ({ center: [], radius: 0, min: [], max: [] } as DataBounds));
  const getBounds = useCallback((bounds: DataBounds) => {
    vec3.transformMat4(cullBounds.center as any, bounds.center as any, (matrixRef as any).current);
    cullBounds.radius = (matrixScaleRef as any).current * bounds.radius;
    return cullBounds;
  });

  const context = useCombinedTransform(boundPosition, boundDifferential, getBounds);

  return (
    provide(TransformContext, context, children)
  );
}, 'Primitive');
