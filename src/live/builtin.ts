import {
  Initial, Setter, Reducer, Key, Task,
  LiveFunction, LiveFiber, LiveContext, LiveElement,
  FunctionCall, DeferredCall, HostInterface, ArrowFunction,
} from './types';

import { compareFibers } from './util';
import { makeFiber, getCurrentFiberID } from './fiber';

export const MORPH        = () => {};
export const DETACH       = () => {};
export const RECONCILE    = () => {};
export const MAP_REDUCE   = () => {};
export const GATHER       = () => {};
export const MULTI_GATHER = () => {};
export const YEET         = () => {};
export const PROVIDE      = () => {};
export const CONSUME      = () => {};

(MORPH        as any).isLiveBuiltin = true;
(DETACH       as any).isLiveBuiltin = true;
(RECONCILE    as any).isLiveBuiltin = true;
(MAP_REDUCE   as any).isLiveBuiltin = true;
(GATHER       as any).isLiveBuiltin = true;
(MULTI_GATHER as any).isLiveBuiltin = true;
(YEET         as any).isLiveBuiltin = true;
(PROVIDE      as any).isLiveBuiltin = true;
(CONSUME      as any).isLiveBuiltin = true;

(RECONCILE    as any).isLiveInline = true;

// use a call to a live function
export const use = <F extends Function>(
  f: LiveFunction<F>,
  key?: Key,
) => (
  ...args: F extends ArrowFunction ? Parameters<F> : any[]
): DeferredCall<F> => ({f, args, key, by: getCurrentFiberID()});

// morph a call to a live function
export const morph = (
  calls: LiveElement<any>,
  key?: Key,
): DeferredCall<() => void> => ({f: MORPH, args: calls as any, key, by: getCurrentFiberID()});

// Detach the rendering of a subtree
export const detach = <F extends Function>(
  call: DeferredCall<F>,
  callback: (render: () => void, fiber: LiveFiber<F>) => void,
  key?: Key,
): DeferredCall<() => void> => ({f: DETACH, args: [call, callback], key, by: getCurrentFiberID()});

// Reconcile an array of calls
export const reconcile = (
  calls: LiveElement<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (Array.isArray(calls)) return ({f: RECONCILE, args: calls, key, by: getCurrentFiberID()});
  return ({f: RECONCILE, args: [calls], key});
}

// Reduce a subtree
export const mapReduce = <R, T>(
  calls: LiveElement<any>,
  map?: (t: T) => R,
  reduce?: (a: R, b: R) => R,
  done?: LiveFunction<(r: R) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: MAP_REDUCE, args: [calls, map, reduce, done], key, by: getCurrentFiberID()});

// Gather items from a subtree
export const gather = <T>(
  calls: LiveElement<any>,
  done?: LiveFunction<(r: T[]) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: GATHER, args: [calls, done], key, by: getCurrentFiberID()});

// Gather items from a subtree
export const multiGather = <T>(
  calls: LiveElement<any>,
  done?: LiveFunction<(r: T[]) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: MULTI_GATHER, args: [calls, done], key, by: getCurrentFiberID()});

// Yeet value(s) upstream
export const yeet = <T>(
  value: T,
  key?: Key,
): DeferredCall<() => void> => ({f: YEET, arg: value, key, by: getCurrentFiberID()});

// Provide a value for a context
export const provide = <T, C>(
  context: LiveContext<C>,
  value: T,
  calls: LiveElement<any> | undefined,
  key?: Key,
): DeferredCall<() => void> => ({f: PROVIDE, args: [context, value, calls, false], key, by: getCurrentFiberID()});

// Provide a value for a context, memoizing if it doesn't change
export const provideMemo = <T, C>(
  context: LiveContext<C>,
  value: T,
  calls: LiveElement<any> | undefined,
  key?: Key,
): DeferredCall<() => void> => ({f: PROVIDE, args: [context, value, calls, true], key, by: getCurrentFiberID()});

// Consume value from a co-context
export const consume = <T, C>(
  context: LiveContext<C>,
  calls: LiveElement<any> | undefined,
  done?: LiveFunction<(r: T) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: CONSUME, args: [context, calls, done], key, by: getCurrentFiberID()});

// Make live context for holding shared data for child nodes
export const makeContext = <T>(initialValue?: T | null, displayName?: string): LiveContext<T> => ({
  initialValue: initialValue ?? undefined,
  displayName,
});
export const createContext = makeContext;

// Co-context value return type sugar
export const flattenRegistry = <T>(registry: Map<LiveFiber<any>, T>): [LiveFiber<any>, T][] => {
  const entries = Array.from(registry.entries());
  entries.sort((a, b) => compareFibers(a[0], b[0]));
  return entries;
}

export const forRegistry = <T>(
  registry: Map<LiveFiber<any>, T>,
  map: (f: LiveFiber<any>, v: T) => void,
) => {
  for (const [f, v] of flattenRegistry(registry)) map(f, v);
}

export const getTailNode = <T>(
  registry: Map<LiveFiber<any>, T>,
) => {
  const entries = flattenRegistry(registry);
  return entries[0];
}

export const getTailValue = <T>(
  registry: Map<LiveFiber<any>, T>,
) => getTailNode(registry)?.[1];
