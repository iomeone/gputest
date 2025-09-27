import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { UniformAttributeValue } from '@use-gpu/core';
import type { VectorLike } from '@use-gpu/traits';
import type { AxesTrait, ObjectTrait, Swizzle } from '../types';

import { parseMatrix, parsePosition, parseRotation, parseQuaternion, parseScale } from '@use-gpu/traits';
import { use, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import { bundleToAttributes, chainTo } from '@use-gpu/shader/wgsl';
import {
  TransformContext,
  useShaderRef, useBoundShader, useCombinedTransform,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { composeTransform } from '../util/compose';
import { swizzleMatrix } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { useAxesTrait, useObjectTrait } from '../traits';

import { getCartesianPosition } from '@use-gpu/wgsl/transform/cartesian.wgsl';

const MATRIX_BINDINGS = bundleToAttributes(getCartesianPosition);

export type CartesianProps = Partial<AxesTrait> & Partial<ObjectTrait> & {
  children?: LiveElement<any>,
};

export const Cartesian: LiveComponent<CartesianProps> = (props) => {
  const {
    children,
  } = props;

  const {range: g, axes: a} = useAxesTrait(props);
  const {position: p, scale: s, quaterion: q, rotation: r, matrix: m} = useObjectTrait(props);

  const matrix = useMemo(() => {
    const x = g[0][0];
    const y = g[1][0];
    const z = g[2][0];
    const dx = (g[0][1] - x) || 1;
    const dy = (g[1][1] - y) || 1;
    const dz = (g[2][1] - z) || 1;

    const matrix = mat4.create();
    mat4.set(matrix,
      2/dx, 0, 0, 0,
      0, 2/dy, 0, 0,
      0, 0, 2/dz, 0,

      -(2*x+dx)/dx,
      -(2*y+dy)/dy,
      -(2*z+dz)/dz,
      1,
    );

    // Swizzle output axes
    if (a !== 'xyzw') {
      const t = mat4.create();
      swizzleMatrix(t, a);
      mat4.multiply(matrix, t, matrix);
    }

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (p || r || q || s) {
      const t = mat4.create();
      composeTransform(t, p, r, q, s);
      mat4.multiply(matrix, t, matrix);
    }

    return matrix;
  }, [g, a, p, r, q, s]);

  const ref = useShaderRef(matrix);
  const bound = useBoundShader(getCartesianPosition, MATRIX_BINDINGS, [ref]);
  const transform = useCombinedTransform(bound);

  return (
    provide(TransformContext, transform,
      provide(RangeContext, g, children ?? [])
    )
  );
};


