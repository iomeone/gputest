import type { LiveComponent, PropsWithChildren, DeferredCall } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait } from '@use-gpu/traits/live';
import { provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { MatrixContext, TransformContext, QueueReconciler, useCombinedTransform, useShaderRef, getShader } from '@use-gpu/workbench';
import { getBundleKey } from '@use-gpu/shader/wgsl';

import { composeTransform4D } from '../util/compose-4d';
import { swizzleMatrix } from '../util/swizzle';
import { vec4, mat4 } from 'gl-matrix';

import { AxesTrait, Object4DTrait } from '../traits';

import { getCartesian4DPosition } from '@use-gpu/wgsl/transform/cartesian-4d.wgsl';

const {signal} = QueueReconciler;

const makeMat4 = () => mat4.create();
const makeVec4 = () => vec4.create();

const NO_MATRIX = mat4.create();

const Traits = combine(AxesTrait, Object4DTrait);
const useTraits = makeUseTrait(Traits);

export type Transform4DProps = PropsWithChildren<TraitProps<typeof Traits>>;

export const Transform4D: LiveComponent<Transform4DProps> = (props: Transform4DProps) => {
  const {
    children,
  } = props;

  if (!children) return;

  const {
    axes: a,
    position: p, scale: s, leftQuaternion: lq, rightQuaternion: rq, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const [swapBase] = useDouble(makeVec4);

  const composed = useOne(makeMat4);

  const [matrix, base] = useMemo(() => {

    const matrix = swapMatrix();
    const base = swapBase();

    // Swizzle output axes (and reinitialize matrix)
    swizzleMatrix(matrix, a);

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (p || lq || rq || s || m) {
      composeTransform4D(composed, base, p, lq, rq, s, m);
      mat4.multiply(matrix, composed, matrix);
    }

    return [matrix, base];
  }, [a, p, lq, rq, s, m]);

  const matrixRef = useShaderRef(matrix);
  const baseRef = useShaderRef(base);

  const transform = useMemo(() => {
    const transform = getShader(getCartesian4DPosition, [matrixRef, baseRef]);
    const key = getBundleKey(transform);
    return {key, transform};
  }, []);

  const context = useCombinedTransform(transform);

  return [
    signal(),
    provide(MatrixContext, NO_MATRIX,
      provide(TransformContext, context, children),
    ),
  ];
};
