import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';

import { memo, provide } from '@use-gpu/live';
import { TransformContext, QueueReconciler, useCombinedMatrixTransform } from '@use-gpu/workbench';

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
