import type { LC, PropsWithChildren, ArrowFunction } from '@use-gpu/live';

import { yeet, memo } from '@use-gpu/live';
import { QueueReconciler } from '../reconcilers/index';

const {quote} = QueueReconciler;

export type DispatchPassProps = PropsWithChildren<{
  calls: {
    dispatch?: ArrowFunction[],
  },
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Dispatch pass.

Executes all dispatch calls.
*/
export const DispatchPass: LC<DispatchPassProps> = memo((props: DispatchPassProps) => {
  const {
    calls,
  } = props;

  const dispatches = toArray(calls['dispatch'] as ArrowFunction[]);

  const run = () => {
    if (dispatches.length) {
      for (const f of dispatches) f();
    }

    return null;
  };

  return quote(yeet(run));

}, 'DispatchPass');
