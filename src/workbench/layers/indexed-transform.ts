import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';

import { provide, extend, useMemo } from '@use-gpu/live';
import { MatrixContext } from '../providers/matrix-provider';
import { TransformContext } from '../providers/transform-provider';
import { useMatrixTransformSources } from '../hooks/useMatrixTransform';
import { useCombinedTransform } from '../hooks/useCombinedTransform';
import { mat4 } from 'gl-matrix';

const NO_MAT4 = mat4.create();

export type IndexedTransformProps = PropsWithChildren<{
  matrices?: ShaderSource,
  normalMatrices?: ShaderSource,
  immediate?: boolean,
}>;

export const IndexedTransform: LC<IndexedTransformProps> = (props: IndexedTransformProps) => {
  const {matrices, normalMatrices, immediate, children} = props;

  const transform = useMatrixTransformSources(matrices, normalMatrices);
  const context = useCombinedTransform(transform);

  if (immediate) {
    return useMemo(() => extend(children, {transform: context}), [children, context]);
  }
  else {
    return useMemo(() => (
      provide(MatrixContext, NO_MAT4,
        provide(TransformContext, context, children)
      )
    ), [children, context]);
  };
};
