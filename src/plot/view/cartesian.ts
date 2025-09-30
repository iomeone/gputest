import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait } from '@use-gpu/traits/live';
import { provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { TransformContext, MatrixContext, useCombinedMatrixTransform, QueueReconciler } from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { composeTransform } from '../util/compose';
import { swizzleMatrix } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { AxesTrait, ObjectTrait } from '../traits';

const {signal} = QueueReconciler;
const makeMat4 = () => mat4.create();

const Traits = combine(AxesTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type CartesianProps = PropsWithChildren<TraitProps<typeof Traits>>;

export const Cartesian: LiveComponent<CartesianProps> = (props: CartesianProps) => {
  const {
    children,
  } = props;

  const {
    range: g, axes: a,
    position: p, scale: s, quaternion: q, rotation: r, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

  const matrix = useMemo(() => {
    const x = g[0][0];
    const y = g[1][0];
    const z = g[2][0];
    const dx = (g[0][1] - x) || 1;
    const dy = (g[1][1] - y) || 1;
    const dz = (g[2][1] - z) || 1;

    const matrix = swapMatrix();
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
      swizzleMatrix(composed, a);
      mat4.multiply(matrix, composed, matrix);
    }

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (m) {
      mat4.multiply(matrix, m, matrix);
    }

    if (p || r || q || s) {
      composeTransform(composed, p, r, q, s);
      mat4.multiply(matrix, composed, matrix);
    }

    return matrix;
  }, [g, a, p, r, q, s, m]);

  const [context, combined] = useCombinedMatrixTransform(matrix);

  return [
    signal(),
      provide(MatrixContext, combined,
        provide(RangeContext, g,
          provide(TransformContext, context, children ?? [])
      )
    )
  ];
};
