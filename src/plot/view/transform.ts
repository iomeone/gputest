import type { LiveComponent, PropsWithChildren, DeferredCall } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait } from '@use-gpu/traits/live';
import { provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { MatrixContext, TransformContext, useCombinedMatrixTransform, useCombinedMatrix, useNoCombinedMatrix, QueueReconciler } from '@use-gpu/workbench';

import { composeTransform } from '../util/compose';
import { swizzleMatrix } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { AxesTrait, ObjectTrait } from '../traits';

const {signal} = QueueReconciler;

const makeMat4 = () => mat4.create();

const Traits = combine(AxesTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type TransformProps = PropsWithChildren<TraitProps<typeof Traits>>;

export const Transform: LiveComponent<TransformProps> = (props: TransformProps) => {
  const {
    children,
  } = props;

  if (!children) return;

  const {
    axes: a,
    position: p, scale: s, quaternion: q, rotation: r, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

  const matrix = useMemo(() => {

    const matrix = swapMatrix();

    // Swizzle output axes (and reinitialize matrix)
    swizzleMatrix(matrix, a);

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (m) {
      mat4.multiply(matrix, m, matrix);
    }
    if (p || r || q || s) {
      composeTransform(composed, p, r, q, s);
      mat4.multiply(matrix, composed, matrix);
    }

    return matrix;
  }, [a, p, r, q, s, m]);

  const isArray = Array.isArray(children)
  const nested = isArray ? !children.find(c => (c as DeferredCall<any>).f !== Transform) : (children as DeferredCall<any>).f === Transform;

  if (nested) {
    const combined = useCombinedMatrix(matrix);
    return provide(MatrixContext, combined, children);
  }
  else {
    useNoCombinedMatrix();
    const [context, combined] = useCombinedMatrixTransform(matrix);

    return [
      signal(),
      provide(MatrixContext, combined,
        provide(TransformContext, context, children),
      ),
    ];
  }
};
