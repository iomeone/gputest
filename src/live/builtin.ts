import type {
  Key, LiveFunction, LiveFiber, LiveCapture, LiveContext, LiveReconciler, LiveElement, LiveNode,
  DeferredCall, ArrowFunction,
} from './types';

import { tagFunction } from './util';
import { getCurrentFiberID } from './current';

/** @hidden */
export const MORPH        = () => {};
/** @hidden */
export const DETACH       = () => {};
/** @hidden */
export const FRAGMENT     = () => {};
/** @hidden */
export const MAP_REDUCE   = () => {};
/** @hidden */
export const GATHER       = () => {};
/** @hidden */
export const MULTI_GATHER = () => {};
/** @hidden */
export const FENCE        = () => {};
/** @hidden */
export const YEET         = () => {};
/** @hidden */
export const PROVIDE      = () => {};
/** @hidden */
export const CAPTURE      = () => {};
/** @hidden */
export const DEBUG        = () => {};
/** @hidden */
export const SUSPEND      = () => {};
/** @hidden */
export const RECONCILE    = () => {};
/** @hidden */
export const QUOTE        = () => {};
/** @hidden */
export const UNQUOTE      = () => {};
/** @hidden */
export const SIGNAL       = () => {};

(MORPH        as any).isLiveBuiltin = true;
(DETACH       as any).isLiveBuiltin = true;
(FRAGMENT     as any).isLiveBuiltin = true;
(MAP_REDUCE   as any).isLiveBuiltin = true;
(GATHER       as any).isLiveBuiltin = true;
(MULTI_GATHER as any).isLiveBuiltin = true;
(FENCE        as any).isLiveBuiltin = true;
(YEET         as any).isLiveBuiltin = true;
(PROVIDE      as any).isLiveBuiltin = true;
(CAPTURE      as any).isLiveBuiltin = true;
(DEBUG        as any).isLiveBuiltin = true;
(SUSPEND      as any).isLiveBuiltin = true;
(RECONCILE    as any).isLiveBuiltin = true;
(QUOTE        as any).isLiveBuiltin = true;
(UNQUOTE      as any).isLiveBuiltin = true;
(SIGNAL       as any).isLiveBuiltin = true;

(FRAGMENT     as any).isLiveInline = true;

/** @hidden */
export const EMPTY_FRAGMENT = {f: FRAGMENT, args: []};

// Inline render ops
type UseArgs<F> = F extends ArrowFunction ? Parameters<F> : any[];

interface Use<F extends ArrowFunction> {
  (f: LiveFunction<F>): DeferredCall<F>;
  (f: LiveFunction<F>, ...args: UseArgs<F>): DeferredCall<F>;
};

/** Use a call to a Live function, reconciled by numeric index. */
export const use: Use<any> = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  ...args: UseArgs<F>
): DeferredCall<F> => ({f, args, key: undefined, by: getCurrentFiberID()} as any);

/** Use a keyed call to a Live function, reconciled by key. */
export const keyed = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  key?: Key,
  ...args: UseArgs<F>
): DeferredCall<F> => ({f, args, key, by: getCurrentFiberID()} as any);

/** Use a call to a Live Component with only a children prop. */
export const wrap = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  children: any,
): DeferredCall<F> => ({f, args: [{children}], key: undefined, by: getCurrentFiberID()} as any);

/** Add arguments to an existing call or calls. */
export const extend = (
  calls: LiveNode<any>,
  props: Record<string, any>,
): LiveElement => {
  if (typeof calls === 'string') throw new Error(`Cannot extend props of string child '${calls}'`);
  if (typeof calls === 'number') throw new Error(`Cannot extend props of number child '${calls}'`);
  if (typeof calls === 'function') throw new Error(`Cannot extend props of function child '${calls}'`);
  if (!calls) return calls;

  if (Array.isArray(calls)) return calls.map(call => extend(call, props)) as any;
  if ('props' in calls) {
    return extend(keyed(calls.type, calls.key, calls.props), props);
  }
  else if (calls.args?.length) {
    const [existing, ...rest] = calls.args;
    return ({...calls, args: [{...existing, ...props}, ...rest] });
  }

  return ({...calls, args: [props] } as any);
}

/** Mutate arguments in-place on an existing call or calls. */
export const mutate = (
  calls: LiveNode<any>,
  props: Record<string, any>,
): LiveElement => {
  if (typeof calls === 'string') throw new Error(`Cannot extend props of string child '${calls}'`);
  if (typeof calls === 'number') throw new Error(`Cannot extend props of number child '${calls}'`);
  if (typeof calls === 'function') throw new Error(`Cannot extend props of function child '${calls}'`);
  if (!calls) return;

  if (Array.isArray(calls)) {
    calls.forEach(call => mutate(call, props)) as any;
  }
  else if ('props' in calls) {
    for (const k in props) calls.props[k] = props[k];
  }
  else if (calls.args?.length) {
    const ps = calls.args[0];
    for (const k in props) ps[k] = props[k];
  }
  else {
    calls.args = [props];
  }
}

/** Morph a call to a Live function.

Morphing will change a component's type, without forcibly unmounting its children.

Children are still reconciled as usual, and only stay if re-rendered by the new parent.

The parent that is being morphed still loses all its own state.
*/
export const morph = (
  calls: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => ({f: MORPH, args: calls as any, key, by: getCurrentFiberID()} as any);

/** Detach the rendering of a Live subtree.

The callback is invoked with a render function, which it can call repeatedly to render the detached fiber. */
export const detach = <F extends ArrowFunction>(
  call: DeferredCall<F> | DeferredCall<F>[],
  callback: (render: () => void, fiber: LiveFiber<F>) => void,
  key?: Key,
): DeferredCall<() => void> => ({f: DETACH, args: [call, callback], key, by: getCurrentFiberID()} as any);

/** Holds an array of Live calls to reconcile. */
export const fragment = (
  calls: LiveNode<any>,
  key?: Key,
): LiveElement => {
  if (key !== null) {
    if (Array.isArray(calls)) return {f: FRAGMENT, args: calls, key};
    return calls != null ? {f: FRAGMENT, args: [calls], key} : null;
  }
  if (Array.isArray(calls)) return calls as any;
  return calls != null ? [calls] as any : null;
}

/** Wrap a fragment in a debug node to mark it. */
export const debug = (
  calls: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (Array.isArray(calls)) return ({f: DEBUG, args: calls, key, by: getCurrentFiberID()} as any);
  return ({f: DEBUG, args: [calls], key} as any);
}

/** Reduce values from a subtree, using the given `map(...)` and `reduce(...)`. */
export const mapReduce = <R, T>(
  calls?: LiveNode<any>,
  map?: (t: T) => R,
  reduce?: (a: R, b: R) => R,
  then?: LiveFunction<(r: R) => LiveElement>,
  fallback?: R,
  key?: Key,
): DeferredCall<() => void> => ({f: MAP_REDUCE, args: [calls, map, reduce, then, fallback], key, by: getCurrentFiberID()} as any);

/** Gather items from a subtree, into a flat array. */
export const gather = <T>(
  calls?: LiveNode<any>,
  then?: LiveFunction<(r: T[]) => LiveElement>,
  fallback?: T[],
  key?: Key,
): DeferredCall<() => void> => ({f: GATHER, args: [calls, then, fallback], key, by: getCurrentFiberID()} as any);

/** Multi-gather items from a subtree, by object key. */
export const multiGather = <T>(
  calls?: LiveNode<any>,
  then?: LiveFunction<(r: Record<string, T[]>) => LiveElement>,
  fallback?: Record<string, T[]>,
  key?: Key,
): DeferredCall<() => void> => ({f: MULTI_GATHER, args: [calls, then, fallback], key, by: getCurrentFiberID()} as any);

/** Fence gathered items from a subtree. */
export const fence = <T>(
  calls?: LiveNode<any>,
  then?: LiveFunction<(r: T) => LiveElement>,
  fallback?: T,
  key?: Key,
): DeferredCall<() => void> => ({f: FENCE, args: [calls, then, fallback], key, by: getCurrentFiberID()} as any);

/** Yeet value(s) upstream. */
export const yeet = <T>(
  value?: T,
  key?: Key,
): DeferredCall<() => void> => ({f: YEET, arg: value, key, by: getCurrentFiberID()} as any);

/** Provide a value for a Live context. */
export const provide = <T, C>(
  context: LiveContext<C>,
  value: T,
  calls?: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => ({f: PROVIDE, args: [context, value, calls], key, by: getCurrentFiberID()} as any);

/** Capture values from a Live context. */
export const capture = <T, C>(
  context: LiveCapture<C>,
  calls?: LiveNode<any>,
  then?: LiveFunction<(r: T) => void>,
  key?: Key,
): DeferredCall<() => void> => ({f: CAPTURE, args: [context, calls, then], key, by: getCurrentFiberID()} as any);

/** Reconcile quoted calls to a separate tree. */
export const reconcileTo = <T>(
  reconciler: LiveReconciler<T>,
  calls?: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => ({f: RECONCILE, args: [reconciler, calls], key, by: getCurrentFiberID()} as any);

/** Quote a subtree and reconcile it into the given reconciler context. */
export const quoteTo = <T>(
  reconciler: LiveReconciler<T>,
  calls?: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => {
  if (!reconciler?.reconciler) throw new Error("Missing reconciler for quote");
  return ({f: QUOTE, args: [reconciler, calls], key, by: getCurrentFiberID()} as any);
};

/** Escape from quote. */
export const unquote = (
  calls?: LiveNode<any>,
  key?: Key,
): DeferredCall<() => void> => ({f: UNQUOTE, args: calls, key, by: getCurrentFiberID()} as any);

/** Signal = quote yeet an empty value */
export const signalTo = <T>(reconciler: LiveReconciler<T>, key?: Key) => {
  if (!reconciler?.reconciler) throw new Error("Missing reconciler for signal");
  return ({f: SIGNAL, args: [reconciler], key, by: getCurrentFiberID()} as any);
};

/** Yeet a suspend symbol. */
export const suspend = (key?: Key) => yeet(SUSPEND, key);

/** LOL. Look, _you_ go try to make JSX.Element polymorphic. */
export const into = (children: any): any => children;

/** Make deprecated warning for component. */
export const deprecated = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  oldName: string,
  newName?: string,
): LiveFunction<F> => {
  let warning = false;

  const wrapped = (props: any) => {
    if (!warning) {
      const unmemo = (s?: string) => s ? s.replace(/Memo\(([^\)]+)\)/g, '$1') : null;

      console.warn(`<${oldName}> is deprecated. Use <${unmemo(newName) ?? (f as any).displayName ?? f.name}> instead.`);
      warning = true;
    }
    return f(props);
  };

  return new Proxy(wrapped, {
    get: (target, s) => {
      if (s === 'name') return oldName;
      return (target as any)[s];
    },
  }) as any;
};

export interface MakeContext {
  <T>(initialValue: T, displayName?: string): LiveContext<T>;
  <T>(initialValue: undefined, displayName?: string): LiveContext<T>;
  <T>(initialValue: null, displayName?: string): LiveContext<T | null>;
};

/** Make Live context for holding shared value for child nodes (defaulted, required or optional). */
export const makeContext: MakeContext = <T>(initialValue?: T | null, displayName?: string) => ({
  initialValue,
  displayName,
  context: true,
});

/** Make Live capture for holding shared value for child nodes */
export const makeCapture = <T>(displayName?: string): LiveCapture<T> => ({
  displayName,
  capture: true,
});

/** Make Live reconciler for incrementally rendering quoted child nodes */
export const makeReconciler = <T>(displayName?: string): LiveReconciler<T> => {
  const self: LiveReconciler<T> = {
    displayName,
    reconciler: true,
    reconcile: (el: LiveElement): LiveElement => reconcileTo(self, el),
    quote: (el: LiveElement): LiveElement => quoteTo(self, el),
    signal: () => signalTo(self),
  };
  return self;
};

/** Tag a component as imperative, always re-rendered from above even if props/state didn't change (deprecated) */
export const makeImperativeFunction = (
  component: LiveFunction<any>,
  displayName?: string,
): LiveFunction<any> => {
  (component as any).isImperativeFunction = true;
  tagFunction(component, displayName);
  return component;
}

/** Component has side-effects, and will re-render even if props object is identical. */
export const imperative = makeImperativeFunction;
