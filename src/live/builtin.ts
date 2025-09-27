import {
  Initial, Setter, Reducer, Key, Task,
  LiveFunction, LiveComponent, LiveFiber, LiveContext, LiveElement,
  FunctionCall, DeferredCall, HostInterface, ArrowFunction,
} from './types';

import { compareFibers } from './util';
import { makeFiber, getCurrentFiberID, makeImperativeFunction } from './fiber';

export const MORPH        = () => {};
export const DETACH       = () => {};
export const FRAGMENT     = () => {};
export const MAP_REDUCE   = () => {};
export const GATHER       = () => {};
export const MULTI_GATHER = () => {};
export const YEET         = () => {};
export const PROVIDE      = () => {};
export const CONSUME      = () => {};
export const DEBUG        = () => {};

(MORPH        as any).isLiveBuiltin = true;
(DETACH       as any).isLiveBuiltin = true;
(FRAGMENT     as any).isLiveBuiltin = true;
(MAP_REDUCE   as any).isLiveBuiltin = true;
(GATHER       as any).isLiveBuiltin = true;
(MULTI_GATHER as any).isLiveBuiltin = true;
(YEET         as any).isLiveBuiltin = true;
(PROVIDE      as any).isLiveBuiltin = true;
(CONSUME      as any).isLiveBuiltin = true;
(DEBUG        as any).isLiveBuiltin = true;

(FRAGMENT     as any).isLiveInline = true;

// Inline render ops

// use a call to a live function
export const use = <F extends Function>(
  f: LiveFunction<F>,
  ...args: F extends ArrowFunction ? Parameters<F> : any[]
): DeferredCall<F> => ({f, args, key: undefined, by: getCurrentFiberID()});

// use a keyed call to a live function
export const keyed = <F extends Function>(
  f: LiveFunction<F>,
  key?: Key,
  ...args: F extends ArrowFunction ? Parameters<F> : any[]
): DeferredCall<F> => ({f, args, key, by: getCurrentFiberID()});

// use a call to a live component with only a children prop
export const wrap = <F extends Function>(
  f: LiveFunction<F>,
  children: any,
): DeferredCall<F> => ({f, args: [{children}], key: undefined, by: getCurrentFiberID()});

// add arguments to an existing call or calls
export const extend = (
  calls: LiveElement<any>,
  props: Record<string, any>,
): LiveElement<any> => {
  if (!calls) return calls;

  if (Array.isArray(calls)) return calls.map(call => extend(call, props));
  if (calls.args?.length) {
    const [existing, ...rest] = calls.args;
    return ({...calls, args: [{...existing, ...props}, ...rest] });
  }
  if (!calls) return calls;
  return ({...calls, args: [props] });
}

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
export const fragment = (
  calls: LiveElement<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (Array.isArray(calls)) return ({f: FRAGMENT, args: calls, key, by: getCurrentFiberID()});
  return ({f: FRAGMENT, args: [calls], key});
}

// Wrap a fragment in a debug node to mark it
export const debug = (
  calls: LiveElement<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (Array.isArray(calls)) return ({f: DEBUG, args: calls, key, by: getCurrentFiberID()});
  return ({f: DEBUG, args: [calls], key});
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
): DeferredCall<() => void> => ({f: PROVIDE, args: [context, value, calls], key, by: getCurrentFiberID()});

// Consume value from a co-context
export const consume = <T, C>(
  context: LiveContext<C>,
  calls: LiveElement<any> | undefined,
  done?: LiveFunction<(r: T) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: CONSUME, args: [context, calls, done], key, by: getCurrentFiberID()});

// Static component decorators
export const imperative = makeImperativeFunction;

// Make live context for holding shared data for child nodes
interface MakeContext<T> {
  <T>(i: undefined, d?: string): LiveContext<T>;
  <T>(i: null, d?: string): LiveContext<T | null>;
  <T>(i: T, d?: string): LiveContext<T>;
};

export const makeContext: MakeContext<unknown> = <T>(initialValue?: T | null, displayName?: string) => ({
  initialValue,
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
  return entries[entries.length - 1];
}

export const getTailValue = <T>(
  registry: Map<LiveFiber<any>, T>,
) => getTailNode(registry)?.[1];
