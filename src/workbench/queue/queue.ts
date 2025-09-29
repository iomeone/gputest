import type { LiveFiber, LC, PropsWithChildren, LiveElement, ArrowFunction, DeferredCall } from '@use-gpu/live';

import {
  gather, provide, yeet, reconcile, quote, unquote,
  makeContext, useContext, useNoContext,
} from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';

export type QueueProps = {
  live?: boolean,
};

/** Dispatch queue. Used by `<WebGPU>` to reconcile quoted drawing commands (yeeted lambdas). */
export const Queue: LC<QueueProps> = (props: PropsWithChildren<QueueProps>): DeferredCall<any> => {
  const {children} = props;
  return reconcile(quote(gather(unquote(children), Resume)));
};

const Resume = (ts: ArrowFunction[]) => {
  const children: LiveElement = [];
  for (const task of ts) {
    const c = task();
    if (c) children.push(c);
  }

  return children.length ? children : null;
};
