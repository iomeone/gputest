import type { LC } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { memo, use, provide, useMemo } from '@use-gpu/live';
import { LineLayer } from '../layers/line-layer';
import { GeometryData } from '../data/geometry-data';
import { makeAABBGeometry } from '../primitives/geometry/aabb';
import { TransformContext } from '../providers/transform-provider';
import { useCombinedMatrixTransform } from '../hooks/useCombinedTransform';

import { mat4 } from 'gl-matrix';

type AABBHelperProps = {
  matrix?: number[] | TypedArray,
  into?: number[] | TypedArray,
  min?: number[] | TypedArray,
  max?: number[] | TypedArray,
  color?: number[] | TypedArray,
  width?: number,
};

const EMPTY: any = [];

export const AABBHelper: LC<AABBHelperProps> = memo((props: AABBHelperProps) => {
  const {
    matrix,
    into,
    min = EMPTY,
    max = EMPTY,
    color = [1, 0.75, 0.5, 1],
    width = 3,
  } = props;

  const geometry = useMemo(() => makeAABBGeometry({min, max}), [min, max]);

  const combined = useMemo(() => {
    const m = mat4.create();
    if (into) mat4.invert(m, into as mat4);
    if (matrix) mat4.multiply(m, m, matrix as mat4);
    return m;
  })

  const [context] = useCombinedMatrixTransform(combined);

  return use(GeometryData, {
    ...geometry,
    render: (geometry: Record<string, ShaderSource>) =>
      provide(TransformContext, context,
        use(LineLayer, { ...geometry.attributes, color, width })
      ),
  });
}, 'AABBHelper');
