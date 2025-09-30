import type { LiveComponent, PropsWithChildren } from '../live';

import { memo, provide } from '../live';
import { TransformContext, QueueReconciler, useCombinedMatrixTransform } from '../workbench';

const {signal} = QueueReconciler;

export type PrimitiveProps = PropsWithChildren<{
  _?: number,
}>;

export const Primitive: LiveComponent<PrimitiveProps> = memo((props: PrimitiveProps) => {
  const {children} = props;

  const [context] = useCombinedMatrixTransform();

  return [
    signal(),
    provide(TransformContext, context, children)
  ];
}, 'Primitive');
