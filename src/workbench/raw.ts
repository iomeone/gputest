import type { LiveFunction, ArrowFunction, PropsWithChildren } from '@use-gpu/live';
import { imperative } from '@use-gpu/live';

export type LiveReturner = (f: ArrowFunction | {children?: ArrowFunction}) => any;
export const Raw: LiveFunction<LiveReturner> = imperative((f: ArrowFunction | {children?: ArrowFunction}) => {
  if (typeof f === 'function') return f();
  if (typeof f.children === 'function') return f.children();
}, 'Raw');

