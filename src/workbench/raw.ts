import type { LiveFunction, ArrowFunction } from '../live';
import { imperative } from '../live';

export type LiveReturner = (f: ArrowFunction | {children?: ArrowFunction}) => any;
export const Raw: LiveFunction<LiveReturner> = imperative((f: ArrowFunction | {children?: ArrowFunction}) => {
  if (typeof f === 'function') return f();
  if (typeof f.children === 'function') return f.children();
}, 'Raw');

