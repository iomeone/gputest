import type { LC, PropsWithChildren, LiveElement, ArrowFunction } from '@use-gpu/live';

import { gather, unquote } from '@use-gpu/live';
import { QueueReconciler } from '../reconcilers/index';

const {reconcile, quote, signal} = QueueReconciler;

export type QueueProps = PropsWithChildren<{
  nested?: boolean,
}>;

/** Dispatch queue. Used by `<WebGPU>` to reconcile quoted drawing commands (yeeted lambdas).

Also used to set up nested queues and gather immediate dispatches. */
export const Queue: LC<QueueProps> = (props: QueueProps) => {
  const {nested, children} = props;

  const Resume = (ts: ArrowFunction[]) => {
    const children: LiveElement = [];
    for (const task of ts) {
      const c = task();
      if (c) children.push(c);
    }

    const render = children.length ? children : null;
    return nested ? [signal(), render] : render;
  };

  return reconcile(quote(gather(unquote(children), Resume)));
};
