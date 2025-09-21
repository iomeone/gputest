import {
  Initial, Setter, Reducer, Key, Task,
  LiveFunction, LiveFiber, LiveContext, LiveElement,
  FunctionCall, DeferredCall, HostInterface,
} from './types';

import { makeFiber } from './fiber';

export const DETACH     = () => () => {};
export const RECONCILE  = () => () => {};
export const MAP_REDUCE = () => () => {};
export const GATHER     = () => () => {};
export const YEET       = () => () => {};
export const PROVIDE    = () => () => {};

(DETACH     as any).isLiveBuiltin = true;
(RECONCILE  as any).isLiveBuiltin = true;
(MAP_REDUCE as any).isLiveBuiltin = true;
(GATHER     as any).isLiveBuiltin = true;
(YEET       as any).isLiveBuiltin = true;
(PROVIDE    as any).isLiveBuiltin = true;

// Prepare to call a live function with optional given persistent fiber
export const bind = <F extends Function>(f: LiveFunction<F>, fiber?: LiveFiber<F> | null, base: number = 0) => {
  fiber = fiber ?? makeFiber(f, null);

  const bound = f(fiber!);
  if (bound.length === 0) {
    return () => {
      enterFiber(fiber!, base);
      const value = bound();
      exitFiber();
      return value;
    }
  }
  if (bound.length === 1) {
    return (arg: any) => {
      enterFiber(fiber!, base);
      const value = bound(arg);
      exitFiber();
      return value;
    }
  }
  return (...args: any[]) => {
    enterFiber(fiber!, base);
    const value = bound.apply(null, args);
    exitFiber();
    return value;
  }
};

// Hide the fiber argument like in React
export let CURRENT_FIBER = null as LiveFiber<any> | null;

// Enter/exit a fiber call
export const enterFiber = <F extends Function>(fiber: LiveFiber<F>, base: number) => {
  CURRENT_FIBER = fiber;

  // Reset state pointer
  fiber.pointer = base;

  // Reset yeet state
  const {yeeted, next} = fiber;
  if (yeeted) yeeted.reduced = yeeted.value = undefined;
}
export const exitFiber  = () => CURRENT_FIBER = null;

// use a call to a live function
export const use = <F extends Function>(
  f: LiveFunction<F>,
  key?: Key,
) => (
  ...args: any[]
): DeferredCall<F> => ({f, args, key});

// Detach the rendering of a subtree
export const detach = <F extends Function>(
  call: DeferredCall<F>,
  callback: (render: () => void, fiber: LiveFiber<F>) => void,
  key?: Key,
): DeferredCall<() => void> => ({f: DETACH, args: [call, callback], key});

// Reconcile an array of calls
export const reconcile = <F extends Function>(
  calls: LiveElement<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (Array.isArray(calls)) return ({f: RECONCILE, args: calls, key});
  return ({f: RECONCILE, arg: [calls], key});
}

// Reduce a subtree
export const mapReduce = <R, T>(
  calls: LiveElement<any>,
  map?: (t: T) => R,
  reduce?: (a: R, b: R) => R,
  done?: LiveFunction<(r: R) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: MAP_REDUCE, args: [calls, map, reduce, done], key});

// Gather items from a subtree
export const gatherReduce = <T>(
  calls: LiveElement<any>,
  done?: LiveFunction<(r: T[]) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: GATHER, args: [calls, done], key});

// Yeet value(s) upstream
export const yeet = <T>(
  value: T,
  key?: Key,
): DeferredCall<() => void> => ({f: YEET, arg: value, key});

// Provide a value for a context
export const provide = <T, C>(
  context: LiveContext<C>,
  value: T,
  calls: LiveElement<any>,
): DeferredCall<() => void> => ({f: PROVIDE, args: [context, value, calls]});

// Hold call info for a fiber
export const makeFunctionCall = <F extends Function>(
  f: LiveFunction<F>,
  args?: any[],
): FunctionCall<F> => ({f, args});

// Make live context for holding shared data for child nodes
export const makeContext = <T>(initialValue?: T, displayName?: string): LiveContext<T> => ({initialValue, displayName});
export const createContext = makeContext;

