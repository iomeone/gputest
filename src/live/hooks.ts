import {
  Initial, Setter, Reducer, Key, Task,
  Live, LiveContext, CallContext,
  DeferredCall, HostInterface,
} from './types';

import { bind, makeContext } from './live';

export const NOP = () => {};
export const NO_DEPS = [] as any[];
export const NO_RESOURCE = {tag: null, value: null};
export const STATE_SLOTS = 2;

// Compares dependency arrays
export const isSameDependencies = (
  prev: any[] | undefined,
  next: any[] | undefined,
) => {
  let valid = true;
  if (next === undefined && prev === undefined) return true;
  if (prev === undefined) valid = false;
  if (next != null && prev != null) {
    const n = prev.length || 0;
    if (n !== next.length || 0) valid = false;
    else for (let i = 0; i < n; ++i) if (prev[i] !== next[i]) {
      valid = false;
      break;
    }
  }
  return valid;
}

// Memoize a live function on all its arguments (shallow comparison per arg)
export const memoFunction = <F extends Function>(
  f: Live<F>
) => (
  context: LiveContext<F>
) => {
  const subContext = makeContext(f, null, context);
  const bound = bind(f, context);
  return (...args: any[]) => {
    const value = useMemo(subContext, 0)(() => bound(args), args);
    return value;
  };
};

// Memoize a live component on its props (shallow comparison per arg)
export const memoComponent = <F extends Function>(
  f: Live<F>
) => (
  context: LiveContext<F>
) => {
  const subContext = makeContext(f, null, context);
  const bound = bind(f, context);
  return (props: Object) => {
    const args = [];
    for (let k in props) {
      args.push(k);
      args.push(props[k]);
    }

    const value = useMemo(subContext, 0)(() => bound(props), args);
    return value;
  };
};

// Allocate state value and a setter for it, initializing with the given value or function
export const useState = <S, F extends Function = any>(context: LiveContext<F>, index: number) => <T = S>(
  initialState: Initial<T>,
): [
  T,
  Setter<T>,
] => {
  const {state, host} = context;
  const i = index * STATE_SLOTS;

  let value    = state[i];
  let setValue = state[i + 1];

  if (value === undefined) {
    value = (initialState instanceof Function) ? initialState() : initialState;
    setValue = host
      ? (value: Reducer<T>) => host.schedule(context, () => {
          if (value instanceof Function) state[i] = value(state[i]);
          else state[i] = value;
        })
      : NOP;

    state[i] = value;
    state[i + 1] = setValue;
  }

  return [value as unknown as T, setValue];
}

// Memoize a value with given dependencies
export const useMemo = <S, F extends Function = any>(context: LiveContext<F>, index: number) => <T = S>(
  initialState: () => T,
  dependencies: any[] = NO_DEPS,
): T => {
  const {state} = context;
  const i = index * STATE_SLOTS;

  let value = state[i];
  const deps  = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialState();

    state[i] = value;
    state[i + 1] = dependencies;
  }

  return value as unknown as T;
}

// Memoize a value with one dependency
export const useOne = <S, F extends Function = any>(context: LiveContext<F>, index: number) => <T = S>(
  initialState: () => T,
  dependency: any = null,
): T => {
  const {state} = context;
  const i = index * STATE_SLOTS;

  let value = state[i];
  const dep   = state[i + 1];

  if (dep !== dependency) {
    value = initialState();

    state[i] = value;
    state[i + 1] = dependency;
  }

  return value as unknown as T;
}

// Memoize a function with given dependencies
export const useCallback = <F extends Function>(context: LiveContext<F>, index: number) => <T extends Function>(
  initialValue: T,
  dependencies: any[] = NO_DEPS,
): T => {
  const {state} = context;
  const i = index * STATE_SLOTS;

  let value = state[i];
  const deps  = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialValue;

    state[i] = value;
    state[i + 1] = dependencies;
  }

  return value as unknown as T;
}

// Bind immediately to a resource, with auto-cleanup on dep change or unmount
export const useResource = <F extends Function>(
  context: LiveContext<F>,
  index: number
) => <R>(
  callback: (dispose: (f: Function) => void) => R,
  dependencies: any[] = NO_DEPS,
): R => {
  const {state, host} = context;
  const i = index * STATE_SLOTS;

  let {tag} = state[i] || NO_RESOURCE;
  const deps = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {

    if (!tag) {
      tag = makeResourceTag();
      state[i] = {tag, value: null};

      if (host) host.track(context, tag);
    }
    else {
      tag(null);
    }

    state[i + 1] = dependencies;

    const value = callback(tag);
    state[i].value = value;
    return value;
  }

  // Assume if return type is used, it's T's
  return (undefined as unknown as R);
}

// Cleanup effect tracker
// Calls previous cleanup before accepting new one
export const makeResourceTag = () => {
  let cleanup = undefined as Task | undefined;

  return (f?: Task) => {
    if (cleanup) cleanup();
    cleanup = f;
  }
}

// Reserve a new context for a hook
/*
export const useHook = <F extends Function>(
  context: LiveContext<F>,
  index: number
) => <H extends Function>(
  hook: Live<H>,
): T => {
  const {state, host} = context;
  const i = index * STATE_SLOTS;

  let bound = state[i];
  let ctx = state[i + 1];

  if (!bound) {
    ctx = makeContext(f, host, context);
    bound = hook(ctx);

    state[i] = bound;
    state[i + 1] = ctx;
  }

  return bound;
}
*/
