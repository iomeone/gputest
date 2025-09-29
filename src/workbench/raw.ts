import type { LiveFunction, LiveElement, ArrowFunction, PropsWithChildren } from '@use-gpu/live';
import { imperative } from '@use-gpu/live';

export type LiveReturner = (f: ArrowFunction | PropsWithChildren<object>) => any;
export const Raw: LiveFunction<LiveReturner> = imperative((f: ArrowFunction | PropsWithChildren<object>) => {
  if (typeof f === 'function') return f();
  if (typeof f.children === 'function') return f.children();
}, 'Raw');

